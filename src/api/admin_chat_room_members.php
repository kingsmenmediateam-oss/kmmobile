<?php
// admin_chat_room_members.php — list members of a chat room (admin only)
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET')     { http_response_code(405); exit; }

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

require_admin();

$roomId = isset($_GET['roomId']) ? (int)$_GET['roomId'] : 0;
if ($roomId <= 0) json_error(400, 'BAD_REQUEST', 'Missing roomId');

$pdo = db();

$st = $pdo->prepare("
  SELECT u.uuid, u.username, u.firstname, u.lastname, u.email, crm.role
  FROM chat_room_members crm
  JOIN users u ON u.uuid = crm.user_id
  WHERE crm.room_id = :rid
  ORDER BY crm.role DESC, u.username ASC
");
$st->execute([':rid' => $roomId]);

$members = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
  $members[] = [
    'uuid'      => (string)$row['uuid'],
    'username'  => (string)$row['username'],
    'firstname' => (string)$row['firstname'],
    'lastname'  => (string)$row['lastname'],
    'email'     => (string)$row['email'],
    'role'      => (string)$row['role'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($members, JSON_UNESCAPED_UNICODE);
