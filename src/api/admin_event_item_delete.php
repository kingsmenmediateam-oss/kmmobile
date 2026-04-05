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

$body  = json_decode((string)file_get_contents('php://input'), true) ?? [];
$id    = (int)($body['id'] ?? 0);
if ($id <= 0) json_error(400, 'BAD_REQUEST', 'Missing id');

$pdo = db();

// Fetch item first to get file_url for physical deletion
$st = $pdo->prepare('SELECT id, event_id, file_url FROM event_info_items WHERE id = :id');
$st->execute([':id' => $id]);
$item = $st->fetch(PDO::FETCH_ASSOC);

if (!$item) json_error(404, 'NOT_FOUND', 'Item not found');

// Verify role/access AFTER we know which event
require_event_access((int)$item['event_id'], $pdo);

// Delete from DB
$del = $pdo->prepare('DELETE FROM event_info_items WHERE id = :id');
$del->execute([':id' => $id]);

// Remove physical file if any
if (!empty($item['file_url'])) {
  $fileUrl = (string)$item['file_url'];
  // Extract filename from URL: …/uploads/filename.ext
  $filename = basename(parse_url($fileUrl, PHP_URL_PATH));
  if ($filename !== '') {
    $filePath = __DIR__ . '/../uploads/' . $filename;
    if (file_exists($filePath)) {
      @unlink($filePath);
    }
  }
}

send_cors_headers();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['deleted' => $id], JSON_UNESCAPED_UNICODE);
