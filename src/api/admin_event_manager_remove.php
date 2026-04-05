<?php
// admin_event_manager_remove.php — retire un event_manager d'un event (admin only)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')    { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$data    = json_decode((string)file_get_contents('php://input'), true) ?? [];
$eventId = (int)($data['eventId'] ?? 0);
$uuid    = trim((string)($data['uuid'] ?? ''));

if ($eventId <= 0) json_error(400, 'BAD_REQUEST', 'Missing eventId');
if ($uuid === '')  json_error(400, 'BAD_REQUEST', 'Missing uuid');

$pdo = db();

$st = $pdo->prepare(
  'DELETE FROM event_managers WHERE event_id = :eid AND user_uuid = :uuid'
);
$st->execute([':eid' => $eventId, ':uuid' => $uuid]);

send_cors_headers();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['removed' => $st->rowCount() > 0, 'eventId' => $eventId, 'uuid' => $uuid], JSON_UNESCAPED_UNICODE);
