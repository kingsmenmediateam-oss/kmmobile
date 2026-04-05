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
  http_response_code(405); exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$role = (string)($payload['role'] ?? '');
if ($role !== 'admin') {
  json_error(403, 'FORBIDDEN', 'Admin role required');
}

// ── Detect form vs JSON ──────────────────────────────────────────────────────
$isMultipart = str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data');

if ($isMultipart) {
  $eventId  = (int)($_POST['eventId']  ?? 0);
  $itemType = trim((string)($_POST['itemType'] ?? ''));
  $title    = trim((string)($_POST['title']    ?? ''));
  $body     = trim((string)($_POST['body']     ?? ''));
} else {
  $data     = json_decode((string)file_get_contents('php://input'), true) ?? [];
  $eventId  = (int)($data['eventId']  ?? 0);
  $itemType = trim((string)($data['itemType'] ?? ''));
  $title    = trim((string)($data['title']    ?? ''));
  $body     = trim((string)($data['body']     ?? ''));
}

// ── Validate ─────────────────────────────────────────────────────────────────
if ($eventId <= 0) json_error(400, 'BAD_REQUEST', 'Missing eventId');
if (!in_array($itemType, ['text', 'pin', 'song', 'file'], true)) {
  json_error(400, 'BAD_REQUEST', 'itemType must be text, pin, song or file');
}
if ($title === '') json_error(400, 'BAD_REQUEST', 'title is required');

$pdo = db();

// Verify event exists
$ev = $pdo->prepare('SELECT id FROM events WHERE id = :id');
$ev->execute([':id' => $eventId]);
if (!$ev->fetchColumn()) json_error(404, 'NOT_FOUND', 'Event not found');

$fileUrl = null;

// ── File upload ───────────────────────────────────────────────────────────────
if ($itemType === 'file') {
  $file = $_FILES['file'] ?? null;
  if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_error(400, 'BAD_REQUEST', 'File upload required for type=file');
  }

  $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime  = $finfo->file($file['tmp_name']);
  if (!in_array($mime, $allowedMimes, true)) {
    json_error(415, 'UNSUPPORTED_MEDIA', 'Only jpg, png and pdf are allowed');
  }

  $ext = match ($mime) {
    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'application/pdf' => 'pdf',
    default           => 'bin',
  };

  $uploadDir = __DIR__ . '/../uploads/';
  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }
  if (!is_writable($uploadDir)) {
    json_error(500, 'UPLOAD_ERROR', 'Upload directory is not writable: ' . realpath($uploadDir));
  }

  $filename = sprintf('event-%d-%s.%s', $eventId, bin2hex(random_bytes(8)), $ext);
  $dest     = $uploadDir . $filename;

  if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_error(500, 'UPLOAD_ERROR', 'Failed to save uploaded file');
  }

  // Build public URL from server host
  $scheme   = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
  $host     = $_SERVER['HTTP_HOST'] ?? 'carecode.be';
  $fileUrl  = $scheme . '://' . $host . '/kmmobile/uploads/' . $filename;
}

// ── Determine next sort_order ─────────────────────────────────────────────────
$sortSt = $pdo->prepare('SELECT COALESCE(MAX(sort_order), 0) + 10 FROM event_info_items WHERE event_id = :eid');
$sortSt->execute([':eid' => $eventId]);
$sortOrder = (int)$sortSt->fetchColumn();

// Map 'text' type to DB enum value 'pin' (free text item)
// The DB enum is: pin, song, file, poll
// We use 'pin' for plain text items (backwards compatible)
$dbType = ($itemType === 'text') ? 'pin' : $itemType;

$st = $pdo->prepare("
  INSERT INTO event_info_items (event_id, item_type, title, body, file_url, sort_order)
  VALUES (:eid, :type, :title, :body, :fileUrl, :sort)
");
$st->execute([
  ':eid'     => $eventId,
  ':type'    => $dbType,
  ':title'   => $title,
  ':body'    => $body,
  ':fileUrl' => $fileUrl,
  ':sort'    => $sortOrder,
]);

$newId = (int)$pdo->lastInsertId();

send_cors_headers();
http_response_code(201);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'id'         => $newId,
  'eventId'    => $eventId,
  'itemType'   => $dbType,
  'title'      => $title,
  'body'       => $body,
  'fileUrl'    => $fileUrl,
  'sortOrder'  => $sortOrder,
], JSON_UNESCAPED_UNICODE);
