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
  http_response_code(405);
  exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$role = (string)($payload['role'] ?? '');
if ($role !== 'admin') {
  json_error(403, 'FORBIDDEN', 'Admin role required');
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id = trim((string)($body['id'] ?? ''));

if ($id === '') {
  json_error(400, 'MISSING_FIELDS', 'id is required');
}

$pdo = db();

// Cascade DELETE sur event_users et event_info_items géré par les FK ON DELETE CASCADE
$st = $pdo->prepare("DELETE FROM events WHERE id = :id");
$st->execute([':id' => $id]);

if ($st->rowCount() === 0) {
  json_error(404, 'NOT_FOUND', 'Event not found');
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['deleted' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
