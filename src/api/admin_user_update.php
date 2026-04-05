<?php
// admin_user_update.php — modifier username, email, rôle d'un utilisateur (admin only)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')    { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_admin();

$data     = json_decode((string)file_get_contents('php://input'), true) ?? [];
$uuid     = trim((string)($data['uuid']     ?? ''));
$username = trim((string)($data['username'] ?? ''));
$email    = trim((string)($data['email']    ?? ''));
$role     = trim((string)($data['role']     ?? ''));

if ($uuid === '')     json_error(400, 'BAD_REQUEST', 'uuid is required');
if ($username === '') json_error(400, 'BAD_REQUEST', 'username is required');
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error(400, 'BAD_REQUEST', 'Valid email is required');
}
if (!in_array($role, ['member', 'event_manager', 'admin', 'superadmin'], true)) {
    json_error(400, 'BAD_REQUEST', 'Invalid role');
}

$pdo = db();

// Vérifie que l'utilisateur existe
$stCheck = $pdo->prepare('SELECT uuid FROM users WHERE uuid = :uuid LIMIT 1');
$stCheck->execute([':uuid' => $uuid]);
if (!$stCheck->fetchColumn()) {
    json_error(404, 'NOT_FOUND', 'User not found');
}

// Unicité username/email (en excluant l'utilisateur lui-même)
$stUniq = $pdo->prepare('SELECT uuid FROM users WHERE (username = :u OR email = :e) AND uuid != :uuid LIMIT 1');
$stUniq->execute([':u' => $username, ':e' => $email, ':uuid' => $uuid]);
if ($stUniq->fetchColumn()) {
    json_error(409, 'CONFLICT', 'Username or email already used by another account');
}

$st = $pdo->prepare('UPDATE users SET username = :username, email = :email, role = :role WHERE uuid = :uuid');
$st->execute([':username' => $username, ':email' => $email, ':role' => $role, ':uuid' => $uuid]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['updated' => true, 'uuid' => $uuid], JSON_UNESCAPED_UNICODE);
