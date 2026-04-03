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

$body = get_json_body();

// roomId peut venir du body JSON, de $_POST ou de $_GET
$roomId = isset($body['roomId']) ? (int)$body['roomId']
        : (isset($_POST['roomId']) ? (int)$_POST['roomId']
        : (int)($_GET['roomId'] ?? 0));

if ($roomId <= 0) {
  json_error(400, 'BAD_REQUEST', 'Missing roomId');
}

$pdo = db();

$userRole = (string)($payload['role'] ?? '');
$isAdmin  = ($userRole === 'admin' || $userRole === 'superadmin');

// Les admins peuvent poster dans n'importe quel salon sans être membres
if (!$isAdmin) {
  $st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id = :rid AND user_id = :uid");
  $st->execute([':rid' => $roomId, ':uid' => $userId]);
  if (!$st->fetchColumn()) {
    json_error(403, 'FORBIDDEN', 'Not a member of this room');
  }
}

$text = trim((string)($body['text'] ?? ''));
if ($text === '' || mb_strlen($text) > 4000) {
  json_error(422, 'INVALID', 'Invalid text');
}

// Optionnel: message auquel on répond
$replyTo = null;
if (isset($body['replyTo']) && is_numeric($body['replyTo'])) {
  $replyToId = (int)$body['replyTo'];
  // Vérifie que le message parent appartient bien au même salon
  $stCheck = $pdo->prepare("SELECT id FROM chat_messages WHERE id = :id AND room_id = :rid LIMIT 1");
  $stCheck->execute([':id' => $replyToId, ':rid' => $roomId]);
  if ($stCheck->fetchColumn()) {
    $replyTo = $replyToId;
  }
}

$st = $pdo->prepare("
  INSERT INTO chat_messages (room_id, user_id, text, reply_to, created_at)
  VALUES (:rid, :uid, :txt, :reply_to, NOW())
");
$st->execute([
  ':rid'      => $roomId,
  ':uid'      => $userId,
  ':txt'      => $text,
  ':reply_to' => $replyTo,
]);

$id = (string)$pdo->lastInsertId();

http_response_code(201);
header('Content-Type: application/json; charset=utf-8');

$displayName = (string)($payload['name'] ?? $payload['preferred_username'] ?? $userId);

echo json_encode([
  'id'        => $id,
  'roomId'    => (string)$roomId,
  'text'      => $text,
  'replyTo'   => $replyTo,
  'createdAt' => gmdate('c'),
  'author'    => [
    'id'          => (string)$userId,
    'displayName' => $displayName,
  ],
  'isMine' => true,
  'status' => 'sent',
], JSON_UNESCAPED_UNICODE);
