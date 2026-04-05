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

// ── Detect multipart vs JSON ──────────────────────────────────────────────────
$isMultipart = str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data');

if ($isMultipart) {
  $id    = (int)($_POST['id']    ?? 0);
  $title = trim((string)($_POST['title'] ?? ''));
  $body  = trim((string)($_POST['body']  ?? ''));
  $replaceFile = !empty($_FILES['file']['name']);
} else {
  $data  = json_decode((string)file_get_contents('php://input'), true) ?? [];
  $id    = (int)($data['id']    ?? 0);
  $title = trim((string)($data['title'] ?? ''));
  $body  = trim((string)($data['body']  ?? ''));
  $replaceFile = false;
}

if ($id <= 0)    json_error(400, 'BAD_REQUEST', 'Missing id');
if ($title === '') json_error(400, 'BAD_REQUEST', 'title is required');

$pdo = db();

// Fetch existing item
$st = $pdo->prepare('SELECT id, event_id, item_type, file_url FROM event_info_items WHERE id = :id');
$st->execute([':id' => $id]);
$existing = $st->fetch(PDO::FETCH_ASSOC);
if (!$existing) json_error(404, 'NOT_FOUND', 'Item not found');

$fileUrl = $existing['file_url']; // keep old URL by default

// ── Optional file replacement ─────────────────────────────────────────────────
if ($replaceFile) {
  $file = $_FILES['file'];
  if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_error(400, 'BAD_REQUEST', 'File upload error');
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
  if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
  if (!is_writable($uploadDir)) {
    json_error(500, 'UPLOAD_ERROR', 'Upload directory is not writable: ' . realpath($uploadDir));
  }

  $filename = sprintf('event-%d-%s.%s', (int)$existing['event_id'], bin2hex(random_bytes(8)), $ext);
  $dest     = $uploadDir . $filename;

  if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_error(500, 'UPLOAD_ERROR', 'Failed to save uploaded file');
  }

  // Delete old file if any
  if (!empty($existing['file_url'])) {
    $oldName = basename(parse_url((string)$existing['file_url'], PHP_URL_PATH));
    $oldPath = $uploadDir . $oldName;
    if ($oldName && file_exists($oldPath)) @unlink($oldPath);
  }

  $scheme  = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
  $host    = $_SERVER['HTTP_HOST'] ?? 'carecode.be';
  $fileUrl = $scheme . '://' . $host . '/kmmobile/uploads/' . $filename;
}

$up = $pdo->prepare('UPDATE event_info_items SET title = :title, body = :body, file_url = :fileUrl WHERE id = :id');
$up->execute([
  ':title'   => $title,
  ':body'    => $body,
  ':fileUrl' => $fileUrl,
  ':id'      => $id,
]);

send_cors_headers();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'id'      => $id,
  'title'   => $title,
  'body'    => $body,
  'fileUrl' => $fileUrl,
], JSON_UNESCAPED_UNICODE);
