<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

function resolve_display_name(array $payload, string $userId): string {
  if ($userId === 'system') return 'SYSTEM';

  $name = $payload['preferred_username']
    ?? $payload['name']
    ?? $payload['email']
    ?? null;

  $name = is_string($name) ? trim($name) : '';
  return $name !== '' ? $name : 'Utilisateur';
}

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;
if ($roomId <= 0) {
  json_error(400, 'BAD_REQUEST', 'Missing roomId');
}

$pdo = db();

// membership check
$st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id = :rid AND user_id = :uid");
$st->execute([':rid' => $roomId, ':uid' => $userId]);
if (!$st->fetchColumn()) {
  json_error(403, 'FORBIDDEN', 'Not a member of this room');
}

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
  SELECT msg.id, msg.room_id, msg.user_id, msg.text, msg.created_at
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

$myDisplayName = resolve_display_name($payload, $userId);

$messages = [];
foreach ($rows as $m) {
  $authorId = (string)$m['user_id'];

  // ✅ displayName jamais = UUID
  if ($authorId === 'system') {
    $authorDisplay = 'SYSTEM';
  } elseif ($authorId === $userId) {
    $authorDisplay = $myDisplayName;     // username du connecté
  } else {
    $authorDisplay = 'Utilisateur';      // fallback propre (pas UUID)
  }

  $messages[] = [
    'id' => (string)$m['id'],
    'roomId' => (string)$m['room_id'],
    'text' => $m['text'],
    'createdAt' => gmdate('c', strtotime($m['created_at'])),
    'author' => [
      'id' => $authorId,
      'displayName' => $authorDisplay,
    ],
    'isMine' => ($authorId === $userId),
    'status' => 'sent',
  ];
}

// mark read
$st2 = $pdo->prepare("UPDATE chat_room_members SET last_read_at = NOW() WHERE room_id = :rid AND user_id = :uid");
$st2->execute([':rid' => $roomId, ':uid' => $userId]);

echo json_encode($messages, JSON_UNESCAPED_UNICODE);
