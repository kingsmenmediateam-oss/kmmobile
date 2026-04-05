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
$role = (string)($payload['role'] ?? '');
if ($role !== 'admin') {
  json_error(403, 'FORBIDDEN', 'Admin role required');
}

$pdo = db();

$sql = "
  SELECT
    e.id,
    e.name,
    e.starts_at,
    e.ends_at,
    e.created_at,
    COUNT(eu.user_id) AS attendee_count
  FROM events e
  LEFT JOIN event_users eu ON eu.event_id = e.id
  GROUP BY e.id
  ORDER BY e.starts_at ASC, e.id ASC
";

$st = $pdo->query($sql);

$events = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
  $events[] = [
    'id'            => (string)$row['id'],
    'name'          => (string)$row['name'],
    'startsAt'      => (string)$row['starts_at'],
    'endsAt'        => (string)$row['ends_at'],
    'createdAt'     => (string)$row['created_at'],
    'attendeeCount' => (int)$row['attendee_count'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($events, JSON_UNESCAPED_UNICODE);
