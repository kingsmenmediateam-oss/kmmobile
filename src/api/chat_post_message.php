<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

function get_json_body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$roomId = isset($_POST['roomId']) ? (int)$_POST['roomId'] : (int)($_GET['roomId'] ?? 0);
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

http_response_code(201);

$displayName = (string)($payload['name'] ?? $payload['preferred_username'] ?? $userId);

echo json_encode([
  'id' => $id,
  'roomId' => (string)$roomId,
  'text' => $text,
  'createdAt' => gmdate('c'),
  'author' => [
    'id' => (string)$userId,
    'displayName' => $displayName,
  ],
  'isMine' => true,
  'status' => 'sent',
], JSON_UNESCAPED_UNICODE);
