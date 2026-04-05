<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_admin();

$pdo = db();

$sql = "
  SELECT
    u.uuid,
    u.username,
    u.firstname,
    u.lastname,
    u.email,
    u.role,
    u.is_active
  FROM users u
  ORDER BY u.username ASC
";

$st = $pdo->prepare($sql);
$st->execute();

$users = [];
foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $u) {
  $users[] = [
    'uuid'     => (string)$u['uuid'],
    'username' => (string)$u['username'],
    'firstname'=> (string)$u['firstname'],
    'lastname' => (string)$u['lastname'],
    'email'    => (string)$u['email'],
    'role'     => (string)$u['role'],
    'isActive' => (bool)$u['is_active'],
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($users, JSON_UNESCAPED_UNICODE);
