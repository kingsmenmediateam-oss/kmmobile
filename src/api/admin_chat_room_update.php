<?php
// admin_chat_room_update.php — rename room + sync members + set up to 2 chat managers
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')    { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$roomId = isset($body['id']) ? (int)$body['id'] : 0;
if ($roomId <= 0) json_error(400, 'BAD_REQUEST', 'Missing room id');

$pdo = db();

// Check room exists
$st = $pdo->prepare('SELECT id FROM chat_rooms WHERE id = :id');
$st->execute([':id' => $roomId]);
if (!$st->fetch()) json_error(404, 'NOT_FOUND', 'Room not found');

// ── 1. Rename ─────────────────────────────────────────────────────────
if (isset($body['name'])) {
  $name = trim((string)$body['name']);
  if ($name === '') json_error(400, 'MISSING_FIELDS', 'name cannot be empty');
  try {
    $pdo->prepare('UPDATE chat_rooms SET name = :name WHERE id = :id')
        ->execute([':name' => $name, ':id' => $roomId]);
  } catch (\PDOException $e) {
    if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'UNIQUE')) {
      json_error(409, 'CONFLICT', 'A room with this name already exists');
    }
    json_error(500, 'DB_ERROR', $e->getMessage());
  }
}

// ── 2. Sync members list ──────────────────────────────────────────────
// body['memberUuids'] = string[]  — full desired list
if (array_key_exists('memberUuids', $body)) {
  $uuids = array_values(array_filter(array_map('trim', (array)($body['memberUuids'] ?? [])), fn($v) => $v !== ''));

  // Validate uuids
  if (count($uuids) > 0) {
    $ph = implode(',', array_fill(0, count($uuids), '?'));
    $st = $pdo->prepare("SELECT uuid FROM users WHERE uuid IN ($ph)");
    $st->execute($uuids);
    $validUuids = array_column($st->fetchAll(PDO::FETCH_ASSOC), 'uuid');
  } else {
    $validUuids = [];
  }

  // Current members
  $st = $pdo->prepare('SELECT user_id FROM chat_room_members WHERE room_id = :rid');
  $st->execute([':rid' => $roomId]);
  $current = array_column($st->fetchAll(PDO::FETCH_ASSOC), 'user_id');

  // Add missing (keep role if already present)
  foreach (array_diff($validUuids, $current) as $uuid) {
    try {
      $pdo->prepare("INSERT IGNORE INTO chat_room_members (room_id, user_id, role) VALUES (:rid, :uid, 'member')")
          ->execute([':rid' => $roomId, ':uid' => $uuid]);
    } catch (\PDOException $e) { /* ignore */ }
  }

  // Remove extra
  foreach (array_diff($current, $validUuids) as $uuid) {
    $pdo->prepare('DELETE FROM chat_room_members WHERE room_id = :rid AND user_id = :uid')
        ->execute([':rid' => $roomId, ':uid' => $uuid]);
  }
}

// ── 3. Set managers (up to 2, role = 'admin' in chat_room_members) ────
// body['managerUuids'] = string[] max 2
if (array_key_exists('managerUuids', $body)) {
  $mgrs = array_slice(
    array_values(array_filter(array_map('trim', (array)($body['managerUuids'] ?? [])), fn($v) => $v !== '')),
    0, 2
  );

  // Demote all current admins to member
  $pdo->prepare("UPDATE chat_room_members SET role = 'member' WHERE room_id = :rid AND role = 'admin'")
      ->execute([':rid' => $roomId]);

  foreach ($mgrs as $uuid) {
    // If not a member yet, add them
    try {
      $pdo->prepare("INSERT IGNORE INTO chat_room_members (room_id, user_id, role) VALUES (:rid, :uid, 'admin')")
          ->execute([':rid' => $roomId, ':uid' => $uuid]);
    } catch (\PDOException $e) { /* ignore */ }
    // Promote to admin
    $pdo->prepare("UPDATE chat_room_members SET role = 'admin' WHERE room_id = :rid AND user_id = :uid")
        ->execute([':rid' => $roomId, ':uid' => $uuid]);
  }
}

// ── Return updated room ───────────────────────────────────────────────
$st = $pdo->prepare('SELECT id, name, description FROM chat_rooms WHERE id = :id');
$st->execute([':id' => $roomId]);
$room = $st->fetch(PDO::FETCH_ASSOC);

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
  'id'          => (string)$room['id'],
  'name'        => $room['name'],
  'description' => $room['description'],
], JSON_UNESCAPED_UNICODE);
