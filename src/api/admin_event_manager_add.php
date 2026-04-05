<?php
// admin_event_manager_add.php — assigne un event_manager à un event (admin only)
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

// Vérifie que l'event existe
$evSt = $pdo->prepare('SELECT id FROM events WHERE id = :id');
$evSt->execute([':id' => $eventId]);
if (!$evSt->fetchColumn()) json_error(404, 'NOT_FOUND', 'Event not found');

// Vérifie que l'utilisateur existe et a le rôle event_manager
$uSt = $pdo->prepare("SELECT uuid, role FROM users WHERE uuid = :uuid LIMIT 1");
$uSt->execute([':uuid' => $uuid]);
$user = $uSt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_error(404, 'NOT_FOUND', 'User not found');
if (!in_array($user['role'], ['event_manager', 'admin', 'superadmin'], true)) {
  json_error(400, 'BAD_REQUEST', 'User must have role event_manager (or admin/superadmin)');
}

// INSERT IGNORE = idempotent
$st = $pdo->prepare(
  'INSERT IGNORE INTO event_managers (event_id, user_uuid) VALUES (:eid, :uuid)'
);
$st->execute([':eid' => $eventId, ':uuid' => $uuid]);

send_cors_headers();
http_response_code(201);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['assigned' => true, 'eventId' => $eventId, 'uuid' => $uuid], JSON_UNESCAPED_UNICODE);
