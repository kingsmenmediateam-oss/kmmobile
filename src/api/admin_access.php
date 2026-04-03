<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

// Vérifier que l'utilisateur a le rôle admin
$userRole = (string)($payload['role'] ?? $payload['realm_access']['roles'][0] ?? '');
if ($userRole !== 'admin' && $userRole !== 'superadmin') {
  json_error(403, 'FORBIDDEN', 'Requires admin role');
}

$pdo = db();

// Retourner les règles d'accès (si la table existe)
// Cette structure dépend de votre implémentation d'autorisation
$sql = "
  SELECT
    resource,
    role,
    description
  FROM access_rules
  ORDER BY resource ASC, role ASC
";

try {
  $st = $pdo->prepare($sql);
  $st->execute();
  $access = [];
  
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $a) {
    $access[] = [
      'resource' => (string)$a['resource'],
      'role' => (string)$a['role'],
      'description' => (string)($a['description'] ?? ''),
    ];
  }
} catch (PDOException $e) {
  // Si la table n'existe pas, retourner une liste vide
  $access = [];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($access, JSON_UNESCAPED_UNICODE);
