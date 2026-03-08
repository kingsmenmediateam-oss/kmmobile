<?php
declare(strict_types=1);

require __DIR__ . '/_guard.php';
$payload = admin_require_auth();

global $pdo;

$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') { http_response_code(401); echo "Missing user id"; exit; }

$roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;
if ($roomId <= 0) { http_response_code(400); echo "Missing roomId"; exit; }

// ✅ On garde la règle existante: il faut être membre pour gérer/modérer
$st = $pdo->prepare("SELECT 1 FROM chat_room_members WHERE room_id=:rid AND user_id=:uid");
$st->execute([':rid'=>$roomId, ':uid'=>$userId]);
if (!$st->fetchColumn()) { http_response_code(403); echo "Not a member of this room"; exit; }

// room info
$st = $pdo->prepare("SELECT id, name, description FROM chat_rooms WHERE id=:id");
$st->execute([':id'=>$roomId]);
$room = $st->fetch();
if (!$room) { http_response_code(404); echo "Room not found"; exit; }

$flash = '';

// Ajout membre
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'add') {
  $newUserId = trim((string)($_POST['new_user_id'] ?? ''));
  $role = (string)($_POST['role'] ?? 'member');
  if ($newUserId === '') {
    $flash = "user_id manquant";
  } else {
    // upsert: si déjà membre, on update role
    $sql = "
      INSERT INTO chat_room_members (room_id, user_id, role, joined_at, last_read_at)
      VALUES (:rid, :uid, :role, NOW(), NULL)
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    ";
    $st = $pdo->prepare($sql);
    $st->execute([':rid'=>$roomId, ':uid'=>$newUserId, ':role'=>$role]);
    header("Location: /admin/chat_room_members.php?roomId={$roomId}");
    exit;
  }
}

// Update rôle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'role') {
  $targetUserId = trim((string)($_POST['user_id'] ?? ''));
  $role = (string)($_POST['role'] ?? 'member');
  if ($targetUserId !== '') {
    $st = $pdo->prepare("UPDATE chat_room_members SET role=:role WHERE room_id=:rid AND user_id=:uid");
    $st->execute([':role'=>$role, ':rid'=>$roomId, ':uid'=>$targetUserId]);
    header("Location: /admin/chat_room_members.php?roomId={$roomId}");
    exit;
  }
}

// Remove membre
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'remove') {
  $targetUserId = trim((string)($_POST['user_id'] ?? ''));
  if ($targetUserId !== '') {
    $st = $pdo->prepare("DELETE FROM chat_room_members WHERE room_id=:rid AND user_id=:uid");
    $st->execute([':rid'=>$roomId, ':uid'=>$targetUserId]);
    header("Location: /admin/chat_room_members.php?roomId={$roomId}");
    exit;
  }
}

// list
$st = $pdo->prepare("
  SELECT user_id, role, joined_at, last_read_at
  FROM chat_room_members
  WHERE room_id=:rid
  ORDER BY joined_at ASC
");
$st->execute([':rid'=>$roomId]);
$members = $st->fetchAll();

$title = "Admin - Membres room";
require __DIR__ . '/_layout_top.php';
?>
<div class="d-flex align-items-center justify-content-between mb-3">
  <div>
    <h1 class="h4 m-0">Membres — Room #<?= h((string)$roomId) ?></h1>
    <div class="text-muted small"><?= h((string)$room['name']) ?></div>
  </div>
  <div class="d-flex gap-2">
    <a class="btn btn-sm btn-outline-secondary" href="/admin/chat_rooms.php">← Rooms</a>
    <a class="btn btn-sm btn-outline-primary" href="/admin/chat_messages.php?roomId=<?= $roomId ?>">Messages</a>
  </div>
</div>

<?php if ($flash): ?>
  <div class="alert alert-warning"><?= h($flash) ?></div>
<?php endif; ?>

<div class="card p-3 mb-3">
  <div class="fw-semibold mb-2">Ajouter un membre</div>
  <form method="post" class="row g-2 align-items-end">
    <input type="hidden" name="action" value="add">
    <div class="col-md-6">
      <label class="form-label">user_id</label>
      <input class="form-control form-control-sm" name="new_user_id" placeholder="UUID / sub du JWT">
    </div>
    <div class="col-md-3">
      <label class="form-label">Rôle</label>
      <select class="form-select form-select-sm" name="role">
        <option value="member">member</option>
        <option value="moderator">moderator</option>
        <option value="admin">admin</option>
      </select>
    </div>
    <div class="col-md-3">
      <button class="btn btn-sm btn-primary w-100">Ajouter / Mettre à jour</button>
    </div>
  </form>
</div>

<table class="table table-sm align-middle">
  <thead>
    <tr>
      <th>User</th>
      <th>Rôle</th>
      <th>Joined</th>
      <th>Last read</th>
      <th class="text-end">Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($members as $m): ?>
      <tr>
        <td class="font-monospace small"><?= h((string)$m['user_id']) ?></td>
        <td>
          <form method="post" class="d-flex gap-2">
            <input type="hidden" name="action" value="role">
            <input type="hidden" name="user_id" value="<?= h((string)$m['user_id']) ?>">
            <select class="form-select form-select-sm" name="role">
              <?php
                $roles = ['member','moderator','admin'];
                foreach ($roles as $r):
              ?>
                <option value="<?= h($r) ?>" <?= ((string)$m['role'] === $r) ? 'selected' : '' ?>><?= h($r) ?></option>
              <?php endforeach; ?>
            </select>
            <button class="btn btn-sm btn-outline-primary">OK</button>
          </form>
        </td>
        <td class="text-muted"><?= h((string)$m['joined_at']) ?></td>
        <td class="text-muted"><?= h((string)($m['last_read_at'] ?? '')) ?></td>
        <td class="text-end">
          <form method="post" class="d-inline" onsubmit="return confirm('Retirer ce membre ?');">
            <input type="hidden" name="action" value="remove">
            <input type="hidden" name="user_id" value="<?= h((string)$m['user_id']) ?>">
            <button class="btn btn-sm btn-outline-danger">Retirer</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>

    <?php if (!$members): ?>
      <tr><td colspan="5" class="text-muted">Aucun membre.</td></tr>
    <?php endif; ?>
  </tbody>
</table>

<?php require __DIR__ . '/_layout_bottom.php'; ?>
