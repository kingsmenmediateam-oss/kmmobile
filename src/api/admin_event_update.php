<?php
// admin_event_update.php — rename event + manage attendees + set event_manager
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')    { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$body    = json_decode(file_get_contents('php://input'), true) ?? [];
$eventId = isset($body['id']) ? (int)$body['id'] : 0;
if ($eventId <= 0) json_error(400, 'BAD_REQUEST', 'Missing event id');

$pdo = db();

// ── 1. Rename ─────────────────────────────────────────────────────────
if (isset($body['name'])) {
  $name = trim((string)$body['name']);
  if ($name === '') json_error(400, 'MISSING_FIELDS', 'name cannot be empty');
  try {
    $st = $pdo->prepare('UPDATE events SET name = :name WHERE id = :id');
    $st->execute([':name' => $name, ':id' => $eventId]);
  } catch (\PDOException $e) {
    if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'UNIQUE')) {
      json_error(409, 'CONFLICT', 'An event with this name already exists');
    }
    json_error(500, 'DB_ERROR', $e->getMessage());
  }
}

// ── 2. Sync attendees list ────────────────────────────────────────────
// Expects body['userUuids'] = string[] — full desired list of attendees
if (array_key_exists('userUuids', $body)) {
  $uuids = array_values(array_filter(array_map('trim', (array)($body['userUuids'] ?? [])), fn($v) => $v !== ''));

  // Fetch current attendees (user_id = uuid varchar)
  $st = $pdo->prepare('SELECT user_id FROM event_users WHERE event_id = :eid');
  $st->execute([':eid' => $eventId]);
  $current = array_column($st->fetchAll(PDO::FETCH_ASSOC), 'user_id');

  // Validate uuids against users table
  if (count($uuids) > 0) {
    $placeholders = implode(',', array_fill(0, count($uuids), '?'));
    $st = $pdo->prepare("SELECT uuid FROM users WHERE uuid IN ($placeholders)");
    $st->execute($uuids);
    $validUuids = array_column($st->fetchAll(PDO::FETCH_ASSOC), 'uuid');
  } else {
    $validUuids = [];
  }

  // Add missing
  $toAdd = array_diff($validUuids, $current);
  foreach ($toAdd as $uuid) {
    try {
      $st = $pdo->prepare("INSERT IGNORE INTO event_users (event_id, user_id, role) VALUES (:eid, :uid, 'attendee')");
      $st->execute([':eid' => $eventId, ':uid' => $uuid]);
    } catch (\PDOException $e) { /* ignore duplicates */ }
  }

  // Remove extra
  $toRemove = array_diff($current, $validUuids);
  foreach ($toRemove as $uuid) {
    $st = $pdo->prepare('DELETE FROM event_users WHERE event_id = :eid AND user_id = :uid');
    $st->execute([':eid' => $eventId, ':uid' => $uuid]);
  }
}

// ── 3. Set event_manager ─────────────────────────────────────────────
// body['managerUuid'] = uuid string | null  (null = remove all managers)
if (array_key_exists('managerUuid', $body)) {
  $mgr = $body['managerUuid'] === null ? null : trim((string)$body['managerUuid']);

  // Remove existing managers for this event
  $pdo->prepare('DELETE FROM event_managers WHERE event_id = :eid')->execute([':eid' => $eventId]);

  if ($mgr !== null && $mgr !== '') {
    // Accept uuid or username
    $st = $pdo->prepare('SELECT uuid FROM users WHERE uuid = :v OR username = :v2 LIMIT 1');
    $st->execute([':v' => $mgr, ':v2' => $mgr]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if (!$row) json_error(404, 'NOT_FOUND', 'User not found: ' . $mgr);

    $st = $pdo->prepare('INSERT INTO event_managers (event_id, user_uuid) VALUES (:eid, :uuid)');
    $st->execute([':eid' => $eventId, ':uuid' => $row['uuid']]);

    // Also make sure the user has the event_manager role
    $pdo->prepare("UPDATE users SET role = 'event_manager' WHERE uuid = :uuid AND role = 'member'")
        ->execute([':uuid' => $row['uuid']]);
  }
}

// ── Return updated event ──────────────────────────────────────────────
$st = $pdo->prepare('SELECT id, name, starts_at, ends_at FROM events WHERE id = :id');
$st->execute([':id' => $eventId]);
$event = $st->fetch(PDO::FETCH_ASSOC);
if (!$event) json_error(404, 'NOT_FOUND', 'Event not found');

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'id'      => (string)$event['id'],
  'name'    => $event['name'],
  'startsAt'=> $event['starts_at'],
  'endsAt'  => $event['ends_at'],
], JSON_UNESCAPED_UNICODE);
