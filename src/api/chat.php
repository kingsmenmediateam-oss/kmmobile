<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
$config = require __DIR__ . '/config.php';

// --- Helpers ---
function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function get_json_body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function db(): PDO {
  global $config;
  static $pdo = null;
  if ($pdo) return $pdo;

  // Exemple : adapte si ton config.php a d'autres clés
  $pdo = new PDO(
    $config['db_dsn'],
    $config['db_user'],
    $config['db_pass'],
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
  return $pdo;
}

function current_user_id_from_payload(array $payload): string {
  $uid = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
  if ($uid === '') {
    json_error(401, 'UNAUTHORIZED', 'Token payload missing user id (sub)');
  }
  return $uid;
}

function assert_member(PDO $pdo, int $roomId, string $userId): void {
  $st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id = :rid AND user_id = :uid");
  $st->execute([':rid' => $roomId, ':uid' => $userId]);
  if (!$st->fetchColumn()) {
    json_error(403, 'FORBIDDEN', 'Not a member of this room');
  }
}

// --- Endpoints ---

function get_rooms(): void {
  $payload = require_auth();
  $userId = current_user_id_from_payload($payload);
  $pdo = db();

  $sql = "
    SELECT
      r.id,
      r.name,
      r.description,
      m.last_read_at,
      (
        SELECT COUNT(*)
        FROM chat_messages mm
        WHERE mm.room_id = r.id
          AND (m.last_read_at IS NULL OR mm.created_at > m.last_read_at)
      ) AS unread_count
    FROM chat_rooms r
    JOIN chat_room_members m ON m.room_id = r.id
    WHERE m.user_id = :uid
    ORDER BY r.name ASC
  ";

  $st = $pdo->prepare($sql);
  $st->execute([':uid' => $userId]);

  $rooms = [];
  foreach ($st->fetchAll() as $r) {
    $rooms[] = [
      'id' => (string)$r['id'],
      'name' => $r['name'],
      'description' => $r['description'],
      'unreadCount' => (int)$r['unread_count'],
    ];
  }

  json_response($rooms);
}

function get_messages(int $roomId): void {
  $payload = require_auth();
  $userId = current_user_id_from_payload($payload);
  $pdo = db();

  assert_member($pdo, $roomId, $userId);

  $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 50;
  $before = $_GET['before'] ?? null;

  $whereBefore = '';
  $beforeId = null;
  $beforeDt = null;

  if (is_string($before) && $before !== '') {
    if (ctype_digit($before)) {
      $whereBefore = " AND msg.id < :beforeId ";
      $beforeId = (int)$before;
    } else {
      $dt = date_create($before);
      if ($dt) {
        $whereBefore = " AND msg.created_at < :beforeDt ";
        $beforeDt = $dt->format('Y-m-d H:i:s');
      }
    }
  }

  $sql = "
    SELECT
      msg.id,
      msg.room_id,
      msg.user_id,
      msg.text,
      msg.created_at
    FROM chat_messages msg
    WHERE msg.room_id = :rid
    $whereBefore
    ORDER BY msg.id DESC
    LIMIT :lim
  ";

  $st = $pdo->prepare($sql);
  $st->bindValue(':rid', $roomId, PDO::PARAM_INT);
  $st->bindValue(':lim', $limit, PDO::PARAM_INT);
  if ($beforeId !== null) $st->bindValue(':beforeId', $beforeId, PDO::PARAM_INT);
  if ($beforeDt !== null) $st->bindValue(':beforeDt', $beforeDt, PDO::PARAM_STR);
  $st->execute();

  $rows = $st->fetchAll();
  $rows = array_reverse($rows); // oldest -> newest

  $messages = [];
  foreach ($rows as $m) {
    $messages[] = [
      'id' => (string)$m['id'],
      'roomId' => (string)$m['room_id'],
      'text' => $m['text'],
      'createdAt' => gmdate('c', strtotime($m['created_at'])),
      'author' => [
        'id' => (string)$m['user_id'],
        // option: si ton JWT contient un nom:
        'displayName' => (string)($payload['name'] ?? $payload['preferred_username'] ?? $m['user_id']),
      ],
      'isMine' => ((string)$m['user_id'] === (string)$userId),
      'status' => 'sent',
    ];
  }

  // mark read
  $st2 = $pdo->prepare("UPDATE chat_room_members SET last_read_at = NOW() WHERE room_id = :rid AND user_id = :uid");
  $st2->execute([':rid' => $roomId, ':uid' => $userId]);

  json_response($messages);
}

function post_message(int $roomId): void {
  $payload = require_auth();
  $userId = current_user_id_from_payload($payload);
  $pdo = db();

  assert_member($pdo, $roomId, $userId);

  $body = get_json_body();
  $text = trim((string)($body['text'] ?? ''));

  if ($text === '' || mb_strlen($text) > 4000) {
    json_error(422, 'INVALID', 'Invalid text');
  }

  $st = $pdo->prepare("
    INSERT INTO chat_messages (room_id, user_id, text, created_at)
    VALUES (:rid, :uid, :txt, NOW())
  ");
  $st->execute([
    ':rid' => $roomId,
    ':uid' => $userId,
    ':txt' => $text,
  ]);

  $id = (string)$pdo->lastInsertId();

  json_response([
    'id' => $id,
    'roomId' => (string)$roomId,
    'text' => $text,
    'createdAt' => gmdate('c'),
    'author' => [
      'id' => (string)$userId,
      'displayName' => (string)($payload['name'] ?? $payload['preferred_username'] ?? $userId),
    ],
    'isMine' => true,
    'status' => 'sent',
  ], 201);
}
