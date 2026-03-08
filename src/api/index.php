<?php
// index.php
declare(strict_types=1);

/**
 * CORS robuste (strict)
 * - Autorise uniquement des origines connues
 * - Répond au préflight OPTIONS en 204
 * - Met Vary: Origin pour éviter les caches incorrects
 */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
function is_allowed_origin_index(string $origin): bool {
  if ($origin === 'https://carecode.be') return true;
  if (preg_match('#^http://localhost(?::\d+)?$#', $origin)) return true;
  if (preg_match('#^http://127\.0\.0\.1(?::\d+)?$#', $origin)) return true;
  if ($origin === 'capacitor://localhost') return true;
  if ($origin === 'ionic://localhost') return true;
  return false;
}

// Autoriser l'origine si elle est dans la whitelist
if ($origin !== '' && is_allowed_origin_index($origin)) {
  header("Access-Control-Allow-Origin: $origin");
  header('Vary: Origin');
} else {
  // Si pas d'Origin (curl/postman) ou origin non reconnue :
  // - on peut soit ne rien mettre
  // - soit laisser passer "sans CORS" (le navigateur bloquera de toute façon)
  // Ici: on ne met pas Allow-Origin si origin non autorisée.
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Préflight (OPTIONS) -> répondre tout de suite
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// JSON pour toutes les réponses
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function require_endpoint(string $filename): void {
  $fullPath = __DIR__ . '/' . $filename;
  if (!is_file($fullPath)) {
    http_response_code(500);
    echo json_encode([
      'error' => 'ENDPOINT_MISSING',
      'message' => "Missing backend file: {$filename}",
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }
  require $fullPath;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// /kmmobile/api/login
if (str_ends_with($path, '/login')) {
  require_endpoint('login.php');
  exit;
}

// /kmmobile/api/me
if (substr($path, -3) === '/me') {
  if ($method === 'GET') {
    require_endpoint('me.php');
  } elseif ($method === 'PUT') {
    require_endpoint('put_me.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET or PUT'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

/**
 * CHAT
 * - GET  /kmmobile/api/chat/rooms
 * - GET  /kmmobile/api/chat/rooms/{roomId}/messages
 * - POST /kmmobile/api/chat/rooms/{roomId}/messages
 */

// GET /chat/rooms
if (preg_match('#/chat/rooms$#', $path)) {
  if ($method === 'GET') {
    require_endpoint('chat_rooms.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

// GET|POST /chat/rooms/{id}/messages
if (preg_match('#/chat/rooms/(\d+)/messages$#', $path, $m)) {
  $roomId = (int)$m[1];
  if ($method === 'GET') {
    $_GET['roomId'] = (string)$roomId;
    require_endpoint('chat_messages.php');
  } elseif ($method === 'POST') {
    $_POST['roomId'] = (string)$roomId;
    require_endpoint('chat_post_message.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET or POST'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

/**
 * MY EVENTS
 * - GET /kmmobile/api/my-events
 * - GET /kmmobile/api/my-events/{eventId}/items
 */
if (preg_match('#/my-events$#', $path)) {
  if ($method === 'GET') {
    require_endpoint('my_events.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

if (preg_match('#/my-events/(\d+)/items$#', $path, $m)) {
  if ($method === 'GET') {
    $_GET['eventId'] = (string)((int)$m[1]);
    require_endpoint('my_event_items.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

/**
 * EMERGENCY
 * - POST /kmmobile/api/emergency/help
 * - GET  /kmmobile/api/emergency/status
 * - POST /kmmobile/api/emergency/join
 */
if (preg_match('#/emergency/help$#', $path)) {
  if ($method === 'POST') {
    require_endpoint('emergency_help.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use POST'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

if (preg_match('#/emergency/status$#', $path)) {
  if ($method === 'GET') {
    require_endpoint('emergency_status.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use GET'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

if (preg_match('#/emergency/join$#', $path)) {
  if ($method === 'POST') {
    require_endpoint('emergency_join.php');
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'METHOD_NOT_ALLOWED', 'message' => 'Use POST'], JSON_UNESCAPED_UNICODE);
  }
  exit;
}

http_response_code(404);
echo json_encode([
  'error' => 'NOT_FOUND',
  'message' => 'Endpoint not found',
], JSON_UNESCAPED_UNICODE);
