<?php
// auth.php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require __DIR__ . '/lib/jwt.php';

/**
 * CORS robuste (strict)
 * IMPORTANT: garder la liste identique à index.php
 */
function is_allowed_origin(string $origin): bool {
  if ($origin === 'https://carecode.be') return true;
  if (preg_match('#^http://localhost(?::\d+)?$#', $origin)) return true;
  if (preg_match('#^http://127\.0\.0\.1(?::\d+)?$#', $origin)) return true;
  if ($origin === 'capacitor://localhost') return true;
  if ($origin === 'ionic://localhost') return true;
  return false;
}

function send_cors_headers(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

  if ($origin !== '' && is_allowed_origin($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
  }

  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With');
  header('Access-Control-Max-Age: 86400');
}

/**
 * À appeler tôt si un endpoint est exécuté sans passer par index.php
 * (préflight direct, ou accès direct au fichier PHP)
 */
function handle_preflight_if_needed(): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    send_cors_headers();
    http_response_code(204);
    exit;
  }
}

function json_error(int $status, string $error, string $message): void {
  send_cors_headers();
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode(['error' => $error, 'message' => $message], JSON_UNESCAPED_UNICODE);
  exit;
}

function get_bearer_token(): ?string {
  $auth = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? $_SERVER['Authorization']
    ?? '';

  if ($auth === '' && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  }

  if ($auth === '' && function_exists('getallheaders')) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
  }

  if (preg_match('/Bearer\s+(.+)$/i', $auth, $m)) {
    return trim($m[1]);
  }
  return null;
}

/**
 * @return array payload JWT
 */
/**
 * Vérifie que l'utilisateur connecté est admin ou superadmin.
 * Retourne le payload JWT.
 */
function require_admin(): array {
  $payload = require_auth();
  $role = (string)($payload['role'] ?? '');
  if ($role !== 'admin' && $role !== 'superadmin') {
    json_error(403, 'FORBIDDEN', 'Admin role required');
  }
  return $payload;
}

/**
 * Vérifie que l'utilisateur connecté est :
 *   - admin/superadmin (accès total), OU
 *   - event_manager assigné à $eventId dans la table event_managers.
 *
 * @param int    $eventId  L'ID de l'event concerné
 * @param PDO    $pdo      Connexion PDO déjà ouverte
 * @return array payload JWT
 */
function require_event_access(int $eventId, PDO $pdo): array {
  $payload = require_auth();
  $role    = (string)($payload['role'] ?? '');
  $uuid    = (string)($payload['sub']  ?? '');

  if ($role === 'admin' || $role === 'superadmin') {
    return $payload;
  }

  if ($role === 'event_manager') {
    $st = $pdo->prepare(
      'SELECT 1 FROM event_managers WHERE event_id = :eid AND user_uuid = :uuid LIMIT 1'
    );
    $st->execute([':eid' => $eventId, ':uuid' => $uuid]);
    if ($st->fetchColumn()) {
      return $payload;
    }
  }

  json_error(403, 'FORBIDDEN', 'Access denied to this event');
}

function require_auth(): array {
  global $config;

  // Toujours envoyer CORS pour les endpoints protégés
  send_cors_headers();

  // au cas où l'endpoint est appelé directement (hors index.php)
  handle_preflight_if_needed();

  $token = get_bearer_token();
  if (!$token) {
    json_error(401, 'UNAUTHORIZED', 'Missing Bearer token');
  }

  try {
    $secrets = [];
    if (!empty($config['jwt_secret']) && is_string($config['jwt_secret'])) {
      $secrets[] = $config['jwt_secret'];
    }
    if (!empty($config['jwt_legacy_secrets']) && is_array($config['jwt_legacy_secrets'])) {
      foreach ($config['jwt_legacy_secrets'] as $legacySecret) {
        if (is_string($legacySecret) && $legacySecret !== '') {
          $secrets[] = $legacySecret;
        }
      }
    }
    $secrets = array_values(array_unique($secrets));

    $lastError = null;
    foreach ($secrets as $secret) {
      try {
        // Strict check (signature + iss + aud + exp)
        $decoded = jwt_decode_verify(
          $token,
          $secret,
          $config['jwt_issuer'] ?? null,
          $config['jwt_audience'] ?? null
        );
        return $decoded['payload'];
      } catch (Throwable $strictError) {
        $lastError = $strictError;
      }
    }

    if ($lastError instanceof Throwable) {
      throw $lastError;
    }
    throw new Exception('INVALID_SIGNATURE');
  } catch (Throwable $e) {
    $code = $e->getMessage();
    $msg = match ($code) {
      'TOKEN_EXPIRED' => 'Token expiré',
      'INVALID_SIGNATURE' => 'Token invalide (signature)',
      'INVALID_ISSUER' => 'Token invalide (issuer)',
      'INVALID_AUDIENCE' => 'Token invalide (audience)',
      'INVALID_TOKEN_FORMAT', 'INVALID_TOKEN_JSON', 'UNSUPPORTED_ALG' => 'Token invalide (format)',
      default => 'Token invalide',
    };
    json_error(401, 'UNAUTHORIZED', $msg);
  }
}
