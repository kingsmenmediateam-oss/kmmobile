<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
  http_response_code(405); exit;
}

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$eventId = isset($_GET['eventId']) ? (int)$_GET['eventId'] : 0;
if ($eventId <= 0) {
  json_error(400, 'BAD_REQUEST', 'Missing eventId');
}

$pdo = db();
require_event_access($eventId, $pdo);

// Verify event exists
$ev = $pdo->prepare('SELECT id FROM events WHERE id = :id');
$ev->execute([':id' => $eventId]);
if (!$ev->fetchColumn()) json_error(404, 'NOT_FOUND', 'Event not found');

$st = $pdo->prepare("
  SELECT
    i.id,
    i.event_id,
    i.item_type,
    i.title,
    i.body,
    i.file_url,
    i.poll_options_json,
    i.sort_order,
    i.created_at
  FROM event_info_items i
  WHERE i.event_id = :eid
  ORDER BY i.sort_order ASC, i.id ASC
");
$st->execute([':eid' => $eventId]);

$items = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
  $pollOptions = [];
  if (!empty($row['poll_options_json'])) {
    $decoded = json_decode((string)$row['poll_options_json'], true);
    if (is_array($decoded)) {
      $pollOptions = array_values(array_map('strval', $decoded));
    }
  }

  $items[] = [
    'id'          => (string)$row['id'],
    'eventId'     => (string)$row['event_id'],
    'type'        => (string)$row['item_type'],
    'title'       => (string)$row['title'],
    'body'        => (string)($row['body'] ?? ''),
    'fileUrl'     => $row['file_url'] !== null ? (string)$row['file_url'] : null,
    'pollOptions' => $pollOptions,
    'sortOrder'   => (int)$row['sort_order'],
    'createdAt'   => gmdate('c', strtotime((string)$row['created_at'])),
  ];
}

send_cors_headers();
header('Content-Type: application/json; charset=utf-8');
echo json_encode($items, JSON_UNESCAPED_UNICODE);
