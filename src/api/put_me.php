<?php
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
  http_response_code(405);
  echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use PUT'], JSON_UNESCAPED_UNICODE);
  exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$uuid = (string)($payload['sub'] ?? '');
if ($uuid === '') {
  http_response_code(401);
  echo json_encode(['error' => 'UNAUTHORIZED', 'message' => 'Invalid token'], JSON_UNESCAPED_UNICODE);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['error' => 'BAD_REQUEST', 'message' => 'Invalid JSON body'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Helpers
function str_or_null($v, int $maxLen): ?string {
  if (!isset($v)) return null;
  $s = trim((string)$v);
  if ($s === '') return null;
  if (mb_strlen($s) > $maxLen) return '__TOO_LONG__';
  return $s;
}

function is_valid_email(?string $email): bool {
  if ($email === null) return true; // champ optionnel
  return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function is_valid_birthday(?string $date): bool {
  if ($date === null) return true; // champ optionnel
  // attendu: YYYY-MM-DD
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) return false;
  $parts = explode('-', $date);
  return checkdate((int)$parts[1], (int)$parts[2], (int)$parts[0]);
}

// Read fields (tous optionnels)
$firstname = str_or_null($data['firstname'] ?? null, 50);
$lastname  = str_or_null($data['lastname'] ?? null, 50);
$email     = str_or_null($data['email'] ?? null, 50);
$birthday  = str_or_null($data['birthday'] ?? null, 10); // YYYY-MM-DD

// Validation longueurs
foreach (['firstname' => $firstname, 'lastname' => $lastname, 'email' => $email, 'birthday' => $birthday] as $k => $v) {
  if ($v === '__TOO_LONG__') {
    http_response_code(422);
    echo json_encode(['error' => 'VALIDATION_ERROR', 'message' => "$k is too long"], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

// Validation email / birthday
if (!is_valid_email($email)) {
  http_response_code(422);
  echo json_encode(['error' => 'VALIDATION_ERROR', 'message' => 'Invalid email'], JSON_UNESCAPED_UNICODE);
  exit;
}
if (!is_valid_birthday($birthday)) {
  http_response_code(422);
  echo json_encode(['error' => 'VALIDATION_ERROR', 'message' => 'Invalid birthday (YYYY-MM-DD)'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Rien à mettre à jour ?
if ($firstname === null && $lastname === null && $email === null && $birthday === null) {
  http_response_code(400);
  echo json_encode(['error' => 'BAD_REQUEST', 'message' => 'No fields to update'], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $pdo = db();

  // Optionnel: email unique
  if ($email !== null) {
    $stmt = $pdo->prepare('SELECT uuid FROM users WHERE email = :email AND uuid <> :uuid LIMIT 1');
    $stmt->execute([':email' => $email, ':uuid' => $uuid]);
    if ($stmt->fetch()) {
      http_response_code(409);
      echo json_encode(['error' => 'CONFLICT', 'message' => 'Email already used'], JSON_UNESCAPED_UNICODE);
      exit;
    }
  }

  // Build update dynamique
  $fields = [];
  $params = [':uuid' => $uuid];

  if ($firstname !== null) { $fields[] = 'firstname = :firstname'; $params[':firstname'] = $firstname; }
  if ($lastname  !== null) { $fields[] = 'lastname = :lastname';   $params[':lastname']  = $lastname; }
  if ($email     !== null) { $fields[] = 'email = :email';         $params[':email']     = $email; }
  if ($birthday  !== null) { $fields[] = 'birthday = :birthday';   $params[':birthday']  = $birthday; }

  $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE uuid = :uuid';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  // Renvoyer le profil à jour
  $stmt = $pdo->prepare('
    SELECT uuid, username, firstname, lastname, email, birthday
    FROM users
    WHERE uuid = :uuid
    LIMIT 1
  ');
  $stmt->execute([':uuid' => $uuid]);
  $user = $stmt->fetch();

  http_response_code(200);
  echo json_encode($user ?: [], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  $errorId = bin2hex(random_bytes(8));
  error_log("[".date('c')."][".$errorId."] ".$e->getMessage()."\n".$e->getTraceAsString()."\n", 3, __DIR__."/logs/api-error.log");
  http_response_code(500);
  echo json_encode(['error' => 'SERVER_ERROR', 'message' => 'Unexpected server error', 'error_id' => $errorId], JSON_UNESCAPED_UNICODE);
}
