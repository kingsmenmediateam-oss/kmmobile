<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$pdo = db();

$userRole = (string)($payload['role'] ?? '');
$isAdmin  = ($userRole === 'admin' || $userRole === 'superadmin');

/**
 * Règles:
 * - Admin => tous les salons visibles
 * - Tous les autres salons (event ou non) => visibles uniquement si
 *   chat_room_members contient (room_id, user_id)
 */
if ($isAdmin) {
  $sql = "
    SELECT
      r.id,
      r.name,
      r.description,
      m.last_read_at,
      (
        SELECT COUNT(*)
        FROM chat_messages mm
        WHERE mm.room_id = r.id
          AND (m.last_read_at IS NULL OR mm.created_at > m.last_read_at)
      ) AS unread_count
    FROM chat_rooms r
    LEFT JOIN chat_room_members m
      ON m.room_id = r.id AND m.user_id = :uid
    ORDER BY r.name ASC
  ";
} else {
  $sql = "
    SELECT
      r.id,
      r.name,
      r.description,
      m.last_read_at,
      (
        SELECT COUNT(*)
        FROM chat_messages mm
        WHERE mm.room_id = r.id
          AND (m.last_read_at IS NULL OR mm.created_at > m.last_read_at)
      ) AS unread_count
    FROM chat_rooms r
    INNER JOIN chat_room_members m
      ON m.room_id = r.id
     AND m.user_id = :uid
    ORDER BY r.name ASC
  ";
}

$st = $pdo->prepare($sql);
$st->execute([':uid' => $userId]);

$rooms = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
  $rooms[] = [
    'id' => (string)$r['id'],
    'name' => (string)$r['name'],
    'description' => $r['description'],
    'unreadCount' => (int)$r['unread_count'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($rooms, JSON_UNESCAPED_UNICODE);
