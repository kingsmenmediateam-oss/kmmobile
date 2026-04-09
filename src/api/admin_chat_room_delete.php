<?php
// admin_chat_room_delete.php — suppression d'un salon et de tout son contenu (admin uniquement)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id   = isset($body['id']) ? (int)$body['id'] : 0;

if ($id <= 0) {
  json_error(400, 'MISSING_FIELDS', 'id is required');
}

$pdo = db();

// Vérifier que le salon existe
$st = $pdo->prepare('SELECT id FROM chat_rooms WHERE id = :id LIMIT 1');
$st->execute([':id' => $id]);
if (!$st->fetchColumn()) {
  json_error(404, 'NOT_FOUND', 'Room not found');
}

// Suppression — chat_messages et chat_room_members sont supprimés en cascade (FK ON DELETE CASCADE)
$del = $pdo->prepare('DELETE FROM chat_rooms WHERE id = :id');
$del->execute([':id' => $id]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['deleted' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
