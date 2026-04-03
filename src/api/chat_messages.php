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

$userRole = (string)($payload['role'] ?? '');
$isAdmin  = ($userRole === 'admin' || $userRole === 'superadmin');

// Les admins voient tous les messages ; les autres doivent être membres du salon
if (!$isAdmin) {
  $st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id = :rid AND user_id = :uid");
  $st->execute([':rid' => $roomId, ':uid' => $userId]);
  if (!$st->fetchColumn()) {
    json_error(403, 'FORBIDDEN', 'Not a member of this room');
  }
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

// Requête complète avec support reply_to (nécessite la migration)
$sqlFull = "
  SELECT
    msg.id, msg.room_id, msg.user_id, msg.text, msg.created_at, msg.reply_to,
    u.username    AS author_username,
    u.firstname   AS author_firstname,
    u.lastname    AS author_lastname,
    rm.text       AS reply_text,
    ru.username   AS reply_author_username,
    ru.firstname  AS reply_author_firstname,
    ru.lastname   AS reply_author_lastname
  FROM chat_messages msg
  LEFT JOIN users u   ON u.uuid  = msg.user_id
  LEFT JOIN chat_messages rm ON rm.id   = msg.reply_to
  LEFT JOIN users ru  ON ru.uuid = rm.user_id
  WHERE msg.room_id = :rid
  $whereBefore
  ORDER BY msg.id DESC
  LIMIT :lim
";

// Requête de secours sans la colonne reply_to (avant migration)
$sqlFallback = "
  SELECT msg.id, msg.room_id, msg.user_id, msg.text, msg.created_at,
         NULL AS reply_to, NULL AS reply_text,
         u.username AS author_username, u.firstname AS author_firstname, u.lastname AS author_lastname,
         NULL AS reply_author_username, NULL AS reply_author_firstname, NULL AS reply_author_lastname
  FROM chat_messages msg
  LEFT JOIN users u ON u.uuid = msg.user_id
  WHERE msg.room_id = :rid
  $whereBefore
  ORDER BY msg.id DESC
  LIMIT :lim
";

$rows = null;
foreach ([$sqlFull, $sqlFallback] as $sql) {
  try {
    $st = $pdo->prepare($sql);
    $st->bindValue(':rid', $roomId, PDO::PARAM_INT);
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    if ($beforeId !== null) $st->bindValue(':beforeId', $beforeId, PDO::PARAM_INT);
    if ($beforeDt !== null) $st->bindValue(':beforeDt', $beforeDt, PDO::PARAM_STR);
    $st->execute();
    $rows = $st->fetchAll();
    break; // succès, on sort de la boucle
  } catch (\PDOException $e) {
    $rows = null; // on essaie la requête suivante
  }
}

if ($rows === null) {
  json_error(500, 'DB_ERROR', 'Failed to load messages');
}

$rows = array_reverse($rows); // oldest -> newest

$myDisplayName = resolve_display_name($payload, $userId);

$messages = [];
foreach ($rows as $m) {
  $authorId = (string)$m['user_id'];

  // ✅ displayName jamais = UUID
  if ($authorId === 'system') {
    $authorDisplay = 'SYSTEM';
  } elseif ($authorId === $userId) {
    $authorDisplay = $myDisplayName;
  } elseif (!empty($m['author_firstname']) && !empty($m['author_lastname'])) {
    $authorDisplay = trim($m['author_firstname'] . ' ' . $m['author_lastname']);
  } elseif (!empty($m['author_username'])) {
    $authorDisplay = $m['author_username'];
  } else {
    $authorDisplay = 'Utilisateur';
  }

  // Construction du contexte de réponse
  $replyData = null;
  if (!empty($m['reply_to'])) {
    if (!empty($m['reply_author_firstname']) && !empty($m['reply_author_lastname'])) {
      $replyAuthorName = trim($m['reply_author_firstname'] . ' ' . $m['reply_author_lastname']);
    } elseif (!empty($m['reply_author_username'])) {
      $replyAuthorName = $m['reply_author_username'];
    } else {
      $replyAuthorName = 'Utilisateur';
    }
    $replyData = [
      'id'     => (string)$m['reply_to'],
      'text'   => mb_strimwidth((string)($m['reply_text'] ?? ''), 0, 120, '…'),
      'author' => $replyAuthorName,
    ];
  }

  $messages[] = [
    'id'        => (string)$m['id'],
    'roomId'    => (string)$m['room_id'],
    'text'      => $m['text'],
    'replyTo'   => $replyData,
    'createdAt' => gmdate('c', strtotime($m['created_at'])),
    'author'    => [
      'id'          => $authorId,
      'displayName' => $authorDisplay,
    ],
    'isMine' => ($authorId === $userId),
    'status' => 'sent',
  ];
}

// mark read (silencieux si l'utilisateur n'est pas membre, ex. admin)
$st2 = $pdo->prepare("UPDATE chat_room_members SET last_read_at = NOW() WHERE room_id = :rid AND user_id = :uid");
$st2->execute([':rid' => $roomId, ':uid' => $userId]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($messages, JSON_UNESCAPED_UNICODE);
