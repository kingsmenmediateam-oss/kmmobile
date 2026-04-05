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

$name     = trim((string)($body['name']     ?? ''));
$startsAt = trim((string)($body['startsAt'] ?? ''));
$endsAt   = trim((string)($body['endsAt']   ?? ''));

if ($name === '' || $startsAt === '' || $endsAt === '') {
  json_error(400, 'MISSING_FIELDS', 'name, startsAt and endsAt are required');
}

// Validate datetime format (YYYY-MM-DD HH:MM or YYYY-MM-DDTHH:MM)
$startsAt = str_replace('T', ' ', $startsAt);
$endsAt   = str_replace('T', ' ', $endsAt);

if (strtotime($startsAt) === false || strtotime($endsAt) === false) {
  json_error(400, 'INVALID_DATE', 'startsAt and endsAt must be valid datetimes');
}

if (strtotime($endsAt) <= strtotime($startsAt)) {
  json_error(400, 'INVALID_DATE_RANGE', 'endsAt must be after startsAt');
}

$pdo = db();

try {
  $st = $pdo->prepare("
    INSERT INTO events (name, starts_at, ends_at)
    VALUES (:name, :starts_at, :ends_at)
  ");
  $st->execute([
    ':name'      => $name,
    ':starts_at' => $startsAt,
    ':ends_at'   => $endsAt,
  ]);
  $id = (string)$pdo->lastInsertId();
} catch (\PDOException $e) {
  if (str_contains($e->getMessage(), 'Duplicate entry') || str_contains($e->getMessage(), 'UNIQUE')) {
    json_error(409, 'CONFLICT', 'An event with this name already exists');
  }
  json_error(500, 'DB_ERROR', 'Database error: ' . $e->getMessage());
}

header('Content-Type: application/json; charset=utf-8');
http_response_code(201);
echo json_encode([
  'id'       => $id,
  'name'     => $name,
  'startsAt' => $startsAt,
  'endsAt'   => $endsAt,
], JSON_UNESCAPED_UNICODE);
