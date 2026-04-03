<?php
// chat_message_delete.php — suppression d'un message (admin uniquement)
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();

$userRole = (string)($payload['role'] ?? '');
if ($userRole !== 'admin' && $userRole !== 'superadmin') {
  json_error(403, 'FORBIDDEN', 'Requires admin role');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  json_error(405, 'METHOD_NOT_ALLOWED', 'Use POST');
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  $data = $_POST;
}

$messageId = isset($data['messageId']) ? (int)$data['messageId'] : 0;
$roomId    = isset($data['roomId'])    ? (int)$data['roomId']    : 0;

if ($messageId <= 0) {
  json_error(400, 'BAD_REQUEST', 'Missing messageId');
}

$pdo = db();

// Vérifier que le message existe (et appartient au bon salon si roomId fourni)
$where = $roomId > 0 ? 'id = :id AND room_id = :rid' : 'id = :id';
$check = $pdo->prepare("SELECT id FROM chat_messages WHERE $where LIMIT 1");
$params = [':id' => $messageId];
if ($roomId > 0) $params[':rid'] = $roomId;
$check->execute($params);

if (!$check->fetchColumn()) {
  json_error(404, 'NOT_FOUND', 'Message not found');
}

$st = $pdo->prepare("DELETE FROM chat_messages WHERE id = :id");
$st->execute([':id' => $messageId]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['deleted' => true, 'id' => (string)$messageId], JSON_UNESCAPED_UNICODE);
