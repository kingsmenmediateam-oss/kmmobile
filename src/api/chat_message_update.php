<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$role = (string)($payload['role'] ?? '');
if ($role !== 'admin' && $role !== 'superadmin') {
  json_error(403, 'FORBIDDEN', 'Admin role required');
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  $data = $_POST;
}

$messageId = isset($data['messageId']) ? (int)$data['messageId'] : 0;
$text      = isset($data['text'])      ? trim((string)$data['text']) : '';

if ($messageId <= 0) json_error(400, 'BAD_REQUEST', 'Missing messageId');
if ($text === '')    json_error(400, 'BAD_REQUEST', 'text cannot be empty');

$pdo = db();

$check = $pdo->prepare('SELECT id FROM chat_messages WHERE id = :id LIMIT 1');
$check->execute([':id' => $messageId]);
if (!$check->fetchColumn()) {
  json_error(404, 'NOT_FOUND', 'Message not found');
}

$st = $pdo->prepare('UPDATE chat_messages SET text = :text WHERE id = :id');
$st->execute([':text' => $text, ':id' => $messageId]);

send_cors_headers();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['updated' => true, 'id' => $messageId, 'text' => $text], JSON_UNESCAPED_UNICODE);
