<?php
declare(strict_types=1);

require __DIR__ . '/_guard.php';
$payload = admin_require_auth();

global $pdo;

$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') { http_response_code(401); echo "Token payload missing user id"; exit; }

/**
 * Même logique que /chat_rooms.php :
 * - salons classiques (event_id NULL) => visibles si chat_room_members
 * - salons event (event_id NOT NULL)  => visibles si event_users
 * - last_read_at vient de chat_room_members si présent
 * - unread_count basé sur last_read_at (NULL => tout non-lu)
 */
$sql = "
  SELECT
    r.id,
    r.name,
    r.description,
    r.event_id,
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
$rooms = $st->fetchAll();

$title = "Admin - Chats (rooms)";
require __DIR__ . '/_layout_top.php';
?>
<h1 class="h4 mb-3">Chats — Rooms visibles pour moi</h1>

<table class="table table-sm align-middle">
  <thead>
    <tr>
      <th>ID</th>
      <th>Nom</th>
      <th>Type</th>
      <th>Description</th>
      <th>Non-lus</th>
      <th class="text-end">Action</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($rooms as $r): ?>
      <?php $isEvent = !empty($r['event_id']); ?>
      <tr>
        <td class="text-muted"><?= h((string)$r['id']) ?></td>
        <td class="fw-semibold"><?= h((string)$r['name']) ?></td>
        <td>
          <span class="badge text-bg-<?= $isEvent ? 'info' : 'secondary' ?>">
            <?= $isEvent ? 'event' : 'classique' ?>
          </span>
        </td>
        <td class="text-muted"><?= h((string)($r['description'] ?? '')) ?></td>
        <td><?= (int)$r['unread_count'] ?></td>
        <td class="text-end">
          <a class="btn btn-sm btn-outline-primary"
             href="/admin/chat_messages.php?roomId=<?= (int)$r['id'] ?>">
            Modérer
          </a>
        </td>
      </tr>
    <?php endforeach; ?>

    <?php if (!$rooms): ?>
      <tr><td colspan="6" class="text-muted">Aucune room visible.</td></tr>
    <?php endif; ?>
  </tbody>
</table>

<?php require __DIR__ . '/_layout_bottom.php'; ?>
