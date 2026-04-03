<?php
// login.php

declare(strict_types=1);

// auth.php doit être chargé en premier : il définit is_allowed_origin() et send_cors_headers()
require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

// CORS + preflight (gère tout localhost:*, capacitor://, ionic://, carecode.be)
send_cors_headers();
handle_preflight_if_needed();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'error' => 'METHOD_NOT_ALLOWED',
    'message' => 'Use POST',
  ]);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  // Fallback for multipart/form-data or x-www-form-urlencoded
  $data = $_POST;
}

$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
  http_response_code(400);
  echo json_encode([
    'error' => 'BAD_REQUEST',
    'message' => 'username and password are required',
  ]);
  exit;
}

try {
  $pdo = db();

  // Table exemple: users(uuid, username, password_hash, is_active)
    $stmt = $pdo->prepare('
      SELECT uuid, username, password_hash, is_active, firstname, lastname, email, birthday, role
      FROM users
      WHERE username = :u OR email = :u
      LIMIT 1
    ');
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

  // Même message pour éviter de leak si user existe
  if (!$user || !(bool)$user['is_active'] || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode([
      'error' => 'INVALID_CREDENTIALS',
      'message' => 'Nom d’utilisateur ou mot de passe incorrect',
    ]);
    exit;
  }

  $now = time();
  $payload = [
    'iss' => $config['jwt_issuer'],
    'aud' => $config['jwt_audience'],
    'iat' => $now,
    'exp' => $now + (int)$config['jwt_ttl_seconds'],
    'sub' => (string)$user['uuid'],
    'username' => $user['username'],
    'firstname' => $user['firstname'],
    'lastname' => $user['lastname'],
    'email' => $user['email'],
    'birthday' => (string)$user['birthday'],
    'role' => (string)($user['role'] ?? 'member'),
  ];

  $token = jwt_encode($payload, $config['jwt_secret']);

  http_response_code(200);
  echo json_encode([
    'token' => $token,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'SERVER_ERROR',
    'message' => 'Unexpected server error',
  ]);
}
