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
$pdo->beginTransaction();

try {
  $displayName = '';

  $stUser = $pdo->prepare("
    SELECT firstname, lastname, username, email
    FROM users
    WHERE uuid = :uid
    LIMIT 1
  ");
  $stUser->execute([':uid' => $userId]);
  $u = $stUser->fetch(PDO::FETCH_ASSOC);
  if (is_array($u)) {
    $fullName = trim((string)($u['firstname'] ?? '') . ' ' . (string)($u['lastname'] ?? ''));
    $displayName = $fullName !== ''
      ? $fullName
      : (string)($u['username'] ?? $u['email'] ?? '');
  }

  if ($displayName === '') {
    $displayName = (string)($payload['name'] ?? $payload['preferred_username'] ?? $userId);
  }

  $roomName = 'emergency room';
  $roomId = 0;

  $stRoom = $pdo->prepare("
    SELECT id
    FROM chat_rooms
    WHERE name = :name
      AND event_id IS NULL
    ORDER BY id ASC
    LIMIT 1
  ");
  $stRoom->execute([':name' => $roomName]);
  $existingRoomId = $stRoom->fetchColumn();

  if ($existingRoomId !== false) {
    $roomId = (int)$existingRoomId;
  } else {
    $stCreateRoom = $pdo->prepare("
      INSERT INTO chat_rooms (name, description, is_public, created_at, event_id)
      VALUES (:name, :description, 0, NOW(), NULL)
    ");
    $stCreateRoom->execute([
      ':name' => $roomName,
      ':description' => 'Emergency alerts and rapid response',
    ]);
    $roomId = (int)$pdo->lastInsertId();
  }

  // Ensure requester is a member of the emergency room
  $stMember = $pdo->prepare("
    INSERT INTO chat_room_members (room_id, user_id, role, last_read_at, joined_at)
    VALUES (:rid, :uid, 'member', NULL, NOW())
    ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
  ");
  $stMember->execute([
    ':rid' => $roomId,
    ':uid' => $userId,
  ]);

  $text = sprintf('I NEED HELP - %s', $displayName);

  $stMsg = $pdo->prepare("
    INSERT INTO chat_messages (room_id, user_id, text, created_at)
    VALUES (:rid, :uid, :text, NOW())
  ");
  $stMsg->execute([
    ':rid' => $roomId,
    ':uid' => $userId,
    ':text' => $text,
  ]);

  $messageId = (int)$pdo->lastInsertId();
  $pdo->commit();

  http_response_code(201);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'ok' => true,
    'roomId' => $roomId,
    'messageId' => $messageId,
    'text' => $text,
    'displayName' => $displayName,
    'createdAt' => gmdate('c'),
  ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  json_error(500, 'SERVER_ERROR', 'Failed to propagate emergency alert');
}
