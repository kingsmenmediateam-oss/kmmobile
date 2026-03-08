<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$pdo = db();
$roomName = 'emergency room';

$stRoom = $pdo->prepare("
  SELECT id
  FROM chat_rooms
  WHERE name = :name
    AND event_id IS NULL
  ORDER BY id ASC
  LIMIT 1
");
$stRoom->execute([':name' => $roomName]);
$roomIdRaw = $stRoom->fetchColumn();

if ($roomIdRaw === false) {
  echo json_encode([
    'someoneNeedsHelp' => false,
    'roomId' => null,
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

$roomId = (int)$roomIdRaw;

$stMember = $pdo->prepare("
  SELECT last_read_at
  FROM chat_room_members
  WHERE room_id = :rid
    AND user_id = :uid
  LIMIT 1
");
$stMember->execute([
  ':rid' => $roomId,
  ':uid' => $userId,
]);
$member = $stMember->fetch(PDO::FETCH_ASSOC);

$someoneNeedsHelp = false;

if (is_array($member)) {
  $lastReadAt = $member['last_read_at'] ?? null;

  $sql = "
    SELECT COUNT(*)
    FROM chat_messages
    WHERE room_id = :rid
      AND user_id <> :uid
      AND text LIKE 'I NEED HELP - %'
  ";
  $params = [':rid' => $roomId, ':uid' => $userId];

  if (is_string($lastReadAt) && $lastReadAt !== '') {
    $sql .= " AND created_at > :lastReadAt ";
    $params[':lastReadAt'] = $lastReadAt;
  }

  $st = $pdo->prepare($sql);
  $st->execute($params);
  $someoneNeedsHelp = ((int)$st->fetchColumn()) > 0;
} else {
  // Not a member yet: only consider recent alerts from others.
  $st = $pdo->prepare("
    SELECT COUNT(*)
    FROM chat_messages
    WHERE room_id = :rid
      AND user_id <> :uid
      AND text LIKE 'I NEED HELP - %'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  ");
  $st->execute([
    ':rid' => $roomId,
    ':uid' => $userId,
  ]);
  $someoneNeedsHelp = ((int)$st->fetchColumn()) > 0;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'someoneNeedsHelp' => $someoneNeedsHelp,
  'roomId' => $roomId,
], JSON_UNESCAPED_UNICODE);
