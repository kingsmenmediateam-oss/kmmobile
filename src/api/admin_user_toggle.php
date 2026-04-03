<?php
// admin_user_toggle.php — activer / désactiver un compte utilisateur
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload  = require_auth();
$adminId  = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($adminId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

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

$uuid = trim((string)($data['uuid'] ?? ''));
if ($uuid === '') {
  json_error(400, 'BAD_REQUEST', 'Missing uuid');
}

// Un admin ne peut pas désactiver son propre compte
if ($uuid === $adminId) {
  json_error(400, 'SELF_DEACTIVATION', 'Cannot deactivate your own account');
}

$pdo = db();

$st = $pdo->prepare("SELECT is_active FROM users WHERE uuid = :uuid LIMIT 1");
$st->execute([':uuid' => $uuid]);
$user = $st->fetch(PDO::FETCH_ASSOC);
if (!$user) {
  json_error(404, 'NOT_FOUND', 'User not found');
}

// Si `active` est fourni → valeur explicite ; sinon → bascule
$newState = isset($data['active']) ? ((bool)$data['active'] ? 1 : 0) : ($user['is_active'] ? 0 : 1);

$st = $pdo->prepare("UPDATE users SET is_active = :active WHERE uuid = :uuid");
$st->execute([':active' => $newState, ':uuid' => $uuid]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['uuid' => $uuid, 'isActive' => (bool)$newState], JSON_UNESCAPED_UNICODE);
