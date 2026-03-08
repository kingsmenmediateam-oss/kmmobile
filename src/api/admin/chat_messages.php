<?php
declare(strict_types=1);

require __DIR__ . '/_guard.php';
$payload = admin_require_auth();

global $pdo;

$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') { http_response_code(401); echo "Missing user id"; exit; }

$roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;
if ($roomId <= 0) { http_response_code(400); echo "Missing roomId"; exit; }

// membership check identique
$st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id = :rid AND user_id = :uid");
$st->execute([':rid' => $roomId, ':uid' => $userId]);
if (!$st->fetchColumn()) { http_response_code(403); echo "Not a member of this room"; exit; }

$limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 50;
$before = $_GET['before'] ?? null;

$whereBefore = '';
$params = [':rid' => $roomId];

if (is_string($before) && $before !== '') {
  if (ctype_digit($before)) {
    $whereBefore = " AND id < :beforeId ";
    $params[':beforeId'] = (int)$before;
  } else {
    $dt = date_create($before);
    if ($dt) {
      $whereBefore = " AND created_at < :beforeDt ";
      $params[':beforeDt'] = $dt->format('Y-m-d H:i:s');
    }
  }
}

$sql = "
  SELECT id, user_id, text, created_at
  FROM chat_messages
  WHERE room_id = :rid
  $whereBefore
  ORDER BY id DESC
  LIMIT :lim
";
$st = $pdo->prepare($sql);
$st->bindValue(':rid', $roomId, PDO::PARAM_INT);
$st->bindValue(':lim', $limit, PDO::PARAM_INT);
if (isset($params[':beforeId'])) $st->bindValue(':beforeId', $params[':beforeId'], PDO::PARAM_INT);
if (isset($params[':beforeDt'])) $st->bindValue(':beforeDt', $params[':beforeDt'], PDO::PARAM_STR);
$st->execute();

$rows = $st->fetchAll();
$rows = array_reverse($rows); // oldest -> newest

$nextBefore = !empty($rows) ? (string)end($rows)['id'] : null;

$title = "Admin - Modération messages";
require __DIR__ . '/_layout_top.php';
?>
<div class="d-flex align-items-center justify-content-between mb-3">
  <h1 class="h4 m-0">Modération — Room #<?= h((string)$roomId) ?></h1>
  <div class="d-flex gap-2">
    <a class="btn btn-sm btn-outline-secondary" href="/admin/chat_rooms.php">← Rooms</a>
    <?php if ($nextBefore): ?>
      <a class="btn btn-sm btn-outline-primary"
         href="/admin/chat_messages.php?roomId=<?= $roomId ?>&limit=<?= $limit ?>&before=<?= h($nextBefore) ?>">
        Page suivante →
      </a>
    <?php endif; ?>
  </div>
</div>

<table class="table table-sm align-middle">
  <thead>
    <tr>
      <th>ID</th>
      <th>Date</th>
      <th>Auteur</th>
      <th>Message</th>
      <th class="text-end">Action</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($rows as $m): ?>
      <tr>
        <td class="text-muted"><?= h((string)$m['id']) ?></td>
        <td class="text-muted"><?= h((string)$m['created_at']) ?></td>
        <td class="font-monospace small"><?= h((string)$m['user_id']) ?></td>
        <td style="white-space: pre-wrap; max-width: 720px;"><?= h((string)$m['text']) ?></td>
        <td class="text-end">
          <form method="post" action="/kingsmen/api/chat_message_delete.php" class="d-inline">
            <input type="hidden" name="roomId" value="<?= $roomId ?>">
            <input type="hidden" name="messageId" value="<?= (int)$m['id'] ?>">
            <button class="btn btn-sm btn-outline-danger"
              onclick="return confirm('Supprimer ce message ?');">
              Supprimer
            </button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>

    <?php if (!$rows): ?>
      <tr><td colspan="5" class="text-muted">Aucun message.</td></tr>
    <?php endif; ?>
  </tbody>
</table>

<?php require __DIR__ . '/_layout_bottom.php'; ?>
