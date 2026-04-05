<?php
// admin_user_create.php — création d'un utilisateur par un admin
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload  = require_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  json_error(405, 'METHOD_NOT_ALLOWED', 'Use POST');
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  $data = $_POST;
}

$firstname = trim((string)($data['firstname'] ?? ''));
$lastname  = trim((string)($data['lastname']  ?? ''));
$username  = trim((string)($data['username']  ?? ''));
$email     = trim((string)($data['email']     ?? ''));
$password  = (string)($data['password'] ?? '');
$role      = trim((string)($data['role'] ?? 'member'));
$birthday  = trim((string)($data['birthday']  ?? '1900-01-01'));

// Validation
if ($firstname === '') json_error(400, 'BAD_REQUEST', 'firstname is required');
if ($lastname  === '') json_error(400, 'BAD_REQUEST', 'lastname is required');
if ($username  === '') json_error(400, 'BAD_REQUEST', 'username is required');
if ($email     === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error(400, 'BAD_REQUEST', 'Valid email is required');
}
if (strlen($password) < 6) {
  json_error(400, 'BAD_REQUEST', 'Password must be at least 6 characters');
}
if (!in_array($role, ['member', 'event_manager', 'admin', 'superadmin'], true)) {
  $role = 'member';
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
  $birthday = '1900-01-01';
}

$pdo = db();

// Unicité username et email
$stCheck = $pdo->prepare("SELECT uuid FROM users WHERE username = :u OR email = :e LIMIT 1");
$stCheck->execute([':u' => $username, ':e' => $email]);
if ($stCheck->fetchColumn()) {
  json_error(409, 'CONFLICT', 'Username or email already exists');
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$st = $pdo->prepare("
  INSERT INTO users (username, password_hash, is_active, role, firstname, lastname, email, birthday)
  VALUES (:username, :hash, 1, :role, :firstname, :lastname, :email, :birthday)
");
$st->execute([
  ':username'  => $username,
  ':hash'      => $hash,
  ':role'      => $role,
  ':firstname' => $firstname,
  ':lastname'  => $lastname,
  ':email'     => $email,
  ':birthday'  => $birthday,
]);

// Récupérer l'UUID généré
$stUuid = $pdo->prepare("SELECT uuid FROM users WHERE username = :u LIMIT 1");
$stUuid->execute([':u' => $username]);
$uuid = (string)$stUuid->fetchColumn();

header('Content-Type: application/json; charset=utf-8');
http_response_code(201);
echo json_encode([
  'uuid'      => $uuid,
  'username'  => $username,
  'firstname' => $firstname,
  'lastname'  => $lastname,
  'email'     => $email,
  'role'      => $role,
  'isActive'  => true,
], JSON_UNESCAPED_UNICODE);
