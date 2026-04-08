<?php
// admin_user_create.php — création d'un utilisateur + envoi mail d'activation
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
$role      = trim((string)($data['role']      ?? 'member'));
$birthday  = trim((string)($data['birthday']  ?? '1900-01-01'));

// Validation
if ($firstname === '') json_error(400, 'BAD_REQUEST', 'firstname is required');
if ($lastname  === '') json_error(400, 'BAD_REQUEST', 'lastname is required');
if ($username  === '') json_error(400, 'BAD_REQUEST', 'username is required');
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error(400, 'BAD_REQUEST', 'Valid email is required');
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

// Crée le compte INACTIF avec un mot de passe verrouillé (hash impossible à matcher)
$lockedHash = '$LOCKED$';

$st = $pdo->prepare("
  INSERT INTO users (username, password_hash, is_active, role, firstname, lastname, email, birthday)
  VALUES (:username, :hash, 0, :role, :firstname, :lastname, :email, :birthday)
");
$st->execute([
  ':username'  => $username,
  ':hash'      => $lockedHash,
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

// Générer un token d'activation sécurisé (64 chars hex)
$token     = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+72 hours'));

$stToken = $pdo->prepare("
  INSERT INTO user_invitations (user_uuid, token, expires_at)
  VALUES (:uuid, :token, :expires_at)
");
$stToken->execute([':uuid' => $uuid, ':token' => $token, ':expires_at' => $expiresAt]);

// Construire le lien d'activation
$config      = require __DIR__ . '/config.php';
$appUrl      = rtrim($config['app_url'] ?? 'https://carecode.be/kmmobile', '/');
$activateUrl = "{$appUrl}/activate.html?token={$token}";

// Envoyer le mail d'activation
$to      = $email;
$subject = 'Kingsmen – Activez votre compte';
$body    = "Bonjour {$firstname},\r\n\r\n"
         . "Un compte Kingsmen a été créé pour vous.\r\n\r\n"
         . "Cliquez sur le lien ci-dessous pour activer votre compte et choisir votre mot de passe :\r\n"
         . "{$activateUrl}\r\n\r\n"
         . "Ce lien est valable 72 heures.\r\n\r\n"
         . "Si vous n'avez pas demandé ce compte, ignorez ce message.\r\n\r\n"
         . "L'équipe Kingsmen";

$headers  = "From: noreply@carecode.be\r\n";
$headers .= "Reply-To: noreply@carecode.be\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$mailSent = mail($to, $subject, $body, $headers);

header('Content-Type: application/json; charset=utf-8');
http_response_code(201);
echo json_encode([
  'uuid'      => $uuid,
  'username'  => $username,
  'firstname' => $firstname,
  'lastname'  => $lastname,
  'email'     => $email,
  'role'      => $role,
  'isActive'  => false,
  'mailSent'  => $mailSent,
  'activateUrl' => $activateUrl, // utile en dev si le mail n'arrive pas
], JSON_UNESCAPED_UNICODE);
