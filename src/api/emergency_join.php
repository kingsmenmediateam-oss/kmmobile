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
$roomId = 0;

$pdo->beginTransaction();

try {
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

  $stMember = $pdo->prepare("
    INSERT INTO chat_room_members (room_id, user_id, role, last_read_at, joined_at)
    VALUES (:rid, :uid, 'member', NULL, NOW())
    ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
  ");
  $stMember->execute([
    ':rid' => $roomId,
    ':uid' => $userId,
  ]);

  $pdo->commit();

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'ok' => true,
    'roomId' => $roomId,
  ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  json_error(500, 'SERVER_ERROR', 'Failed to join emergency room');
}
