<?php
// admin_event_manager_list.php — liste les managers d'un event (admin only)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET')     { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$eventId = isset($_GET['eventId']) ? (int)$_GET['eventId'] : 0;
if ($eventId <= 0) json_error(400, 'BAD_REQUEST', 'Missing eventId');

$pdo = db();

$st = $pdo->prepare("
  SELECT u.uuid, u.username, u.firstname, u.lastname, u.email, em.created_at
  FROM event_managers em
  JOIN users u ON u.uuid = em.user_uuid
  WHERE em.event_id = :eid
  ORDER BY u.username ASC
");
$st->execute([':eid' => $eventId]);

$managers = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
  $managers[] = [
    'uuid'      => (string)$row['uuid'],
    'username'  => (string)$row['username'],
    'firstname' => (string)$row['firstname'],
    'lastname'  => (string)$row['lastname'],
    'email'     => (string)$row['email'],
    'assignedAt'=> (string)$row['created_at'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($managers, JSON_UNESCAPED_UNICODE);
