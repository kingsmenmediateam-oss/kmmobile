<?php
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET']);
  exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();

$uuid = (string)($payload['sub'] ?? '');
if ($uuid === '') {
  http_response_code(401);
  echo json_encode(['error' => 'UNAUTHORIZED', 'message' => 'Invalid token']);
  exit;
}

try {
  $pdo = db();

  $stmt = $pdo->prepare('
    SELECT uuid, username, firstname, lastname, email, birthday
    FROM users
    WHERE uuid = :uuid
    LIMIT 1
  ');
  $stmt->execute([':uuid' => $uuid]);
  $user = $stmt->fetch();

  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'NOT_FOUND', 'message' => 'User not found']);
    exit;
  }

  http_response_code(200);
  echo json_encode([
    'uuid' => $user['uuid'],
    'username' => $user['username'],
    'firstname' => $user['firstname'] ?? null,
    'lastname' => $user['lastname'] ?? null,
    'email' => $user['email'] ?? null,
    'birthday' => $user['birthday'] ?? null, // YYYY-MM-DD
  ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'SERVER_ERROR', 'message' => 'Unexpected server error']);
}
