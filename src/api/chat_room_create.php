<?php
// chat_room_create.php — création d'un salon (admin uniquement)
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();

// Admin uniquement
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

$name        = trim((string)($data['name']        ?? ''));
$description = trim((string)($data['description'] ?? ''));

if ($name === '') {
  json_error(400, 'BAD_REQUEST', 'name is required');
}

$pdo = db();

// Vérifier qu'un salon du même nom n'existe pas déjà
$check = $pdo->prepare("SELECT id FROM chat_rooms WHERE name = :name LIMIT 1");
$check->execute([':name' => $name]);
if ($check->fetchColumn()) {
  json_error(409, 'CONFLICT', 'A room with this name already exists');
}

$st = $pdo->prepare("
  INSERT INTO chat_rooms (name, description, is_public, created_at)
  VALUES (:name, :desc, 0, NOW())
");
$st->execute([
  ':name' => $name,
  ':desc' => $description !== '' ? $description : null,
]);

$id = (int)$pdo->lastInsertId();

header('Content-Type: application/json; charset=utf-8');
http_response_code(201);
echo json_encode([
  'id'          => (string)$id,
  'name'        => $name,
  'description' => $description !== '' ? $description : null,
], JSON_UNESCAPED_UNICODE);
