<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$eventId = isset($_GET['eventId']) ? (int)$_GET['eventId'] : 0;
if ($eventId <= 0) {
  json_error(400, 'BAD_REQUEST', 'Missing eventId');
}

$pdo = db();

$membership = $pdo->prepare("
  SELECT 1
  FROM event_users
  WHERE event_id = :eid
    AND user_id = :uid
");
$membership->execute([':eid' => $eventId, ':uid' => $userId]);
if (!$membership->fetchColumn()) {
  json_error(403, 'FORBIDDEN', 'Not registered to this event');
}

$sql = "
  SELECT
    i.id,
    i.event_id,
    i.item_type,
    i.title,
    i.body,
    i.file_url,
    i.poll_options_json,
    i.created_at
  FROM event_info_items i
  WHERE i.event_id = :eid
  ORDER BY i.sort_order ASC, i.id ASC
";

$st = $pdo->prepare($sql);
$st->execute([':eid' => $eventId]);

$items = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $itemRow) {
  $pollOptions = [];
  if (!empty($itemRow['poll_options_json'])) {
    $decoded = json_decode((string)$itemRow['poll_options_json'], true);
    if (is_array($decoded)) {
      $pollOptions = array_values(array_map('strval', $decoded));
    }
  }

  $items[] = [
    'id' => (string)$itemRow['id'],
    'eventId' => (string)$itemRow['event_id'],
    'type' => (string)$itemRow['item_type'],
    'title' => (string)$itemRow['title'],
    'body' => (string)($itemRow['body'] ?? ''),
    'fileUrl' => $itemRow['file_url'] !== null ? (string)$itemRow['file_url'] : null,
    'pollOptions' => $pollOptions,
    'createdAt' => gmdate('c', strtotime((string)$itemRow['created_at'])),
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($items, JSON_UNESCAPED_UNICODE);
