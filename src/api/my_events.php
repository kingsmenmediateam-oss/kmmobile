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

$pdo = db();

$sql = "
  SELECT
    e.id,
    e.name,
    e.starts_at,
    e.ends_at,
    eu.role
  FROM event_users eu
  INNER JOIN events e ON e.id = eu.event_id
  WHERE eu.user_id = :uid
  ORDER BY e.starts_at ASC, e.id ASC
";

$st = $pdo->prepare($sql);
$st->execute([':uid' => $userId]);

$events = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $eventRow) {
  $events[] = [
    'id' => (string)$eventRow['id'],
    'name' => (string)$eventRow['name'],
    'startsAt' => gmdate('c', strtotime((string)$eventRow['starts_at'])),
    'endsAt' => gmdate('c', strtotime((string)$eventRow['ends_at'])),
    'role' => (string)$eventRow['role'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($events, JSON_UNESCAPED_UNICODE);
