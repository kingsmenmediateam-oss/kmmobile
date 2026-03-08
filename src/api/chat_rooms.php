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

/**
 * Règles:
 * - Salons "classiques" (event_id NULL) => visibles si chat_room_members contient (room_id, user_id)
 * - Salons "event" (event_id NOT NULL)  => visibles si event_users contient (event_id, user_id)
 * - last_read_at vient de chat_room_members si présent, sinon NULL
 * - unread_count calculé à partir de last_read_at (NULL => tout est non-lu)
 */
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
    ON m.room_id = r.id
   AND m.user_id = :uid
  WHERE
    (
      r.event_id IS NULL
      AND m.user_id IS NOT NULL
    )
    OR
    (
      r.event_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM event_users eu
        WHERE eu.event_id = r.event_id
          AND eu.user_id = :uid
      )
    )
  ORDER BY r.name ASC
";

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
