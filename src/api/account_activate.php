<?php
// account_activate.php — validation du token + définition du mot de passe
// Endpoint PUBLIC (pas d'auth requise)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/db.php';
require __DIR__ . '/auth.php'; // pour json_error()

$method = $_SERVER['REQUEST_METHOD'] ?? '';

// ── GET : vérifie que le token est valide et retourne le prénom/nom ───────────
if ($method === 'GET') {
  $token = trim($_GET['token'] ?? '');
  if ($token === '') json_error(400, 'BAD_REQUEST', 'Missing token');

  $pdo = db();
  $st  = $pdo->prepare("
    SELECT i.user_uuid, i.expires_at, i.used_at,
           u.firstname, u.lastname, u.email
    FROM   user_invitations i
    JOIN   users u ON u.uuid = i.user_uuid
    WHERE  i.token = :token
    LIMIT  1
  ");
  $st->execute([':token' => $token]);
  $row = $st->fetch();

  if (!$row)                             json_error(404, 'NOT_FOUND',  'Invalid or unknown token');
  if ($row['used_at'] !== null)          json_error(410, 'GONE',       'This activation link has already been used');
  if (strtotime($row['expires_at']) < time()) json_error(410, 'EXPIRED', 'This activation link has expired');

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'valid'     => true,
    'firstname' => $row['firstname'],
    'lastname'  => $row['lastname'],
    'email'     => $row['email'],
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// ── POST : définit le mot de passe et active le compte ───────────────────────
if ($method === 'POST') {
  $data     = json_decode((string)file_get_contents('php://input'), true) ?? [];
  $token    = trim((string)($data['token']    ?? ''));
  $password = (string)($data['password'] ?? '');

  if ($token    === '') json_error(400, 'BAD_REQUEST', 'Missing token');
  if (strlen($password) < 6) json_error(400, 'BAD_REQUEST', 'Password must be at least 6 characters');

  $pdo = db();
  $st  = $pdo->prepare("
    SELECT i.id, i.user_uuid, i.expires_at, i.used_at
    FROM   user_invitations i
    WHERE  i.token = :token
    LIMIT  1
  ");
  $st->execute([':token' => $token]);
  $row = $st->fetch();

  if (!$row)                             json_error(404, 'NOT_FOUND',  'Invalid or unknown token');
  if ($row['used_at'] !== null)          json_error(410, 'GONE',       'This activation link has already been used');
  if (strtotime($row['expires_at']) < time()) json_error(410, 'EXPIRED', 'This activation link has expired');

  $hash = password_hash($password, PASSWORD_BCRYPT);

  // Activer le compte + définir le mot de passe
  $stUser = $pdo->prepare("UPDATE users SET password_hash = :hash, is_active = 1 WHERE uuid = :uuid");
  $stUser->execute([':hash' => $hash, ':uuid' => $row['user_uuid']]);

  // Marquer le token comme utilisé
  $stUsed = $pdo->prepare("UPDATE user_invitations SET used_at = NOW() WHERE id = :id");
  $stUsed->execute([':id' => $row['id']]);

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['activated' => true], JSON_UNESCAPED_UNICODE);
  exit;
}

json_error(405, 'METHOD_NOT_ALLOWED', 'Use GET or POST');
