<?php
// lib/jwt.php

declare(strict_types=1);

function base64url_encode(string $data): string {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
  $remainder = strlen($data) % 4;
  if ($remainder) {
    $data .= str_repeat('=', 4 - $remainder);
  }
  return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function jwt_encode(array $payload, string $secret): string {
  $header = ['alg' => 'HS256', 'typ' => 'JWT'];

  $h = base64url_encode(json_encode($header, JSON_UNESCAPED_SLASHES));
  $p = base64url_encode(json_encode($payload, JSON_UNESCAPED_SLASHES));

  $sig = hash_hmac('sha256', "$h.$p", $secret, true);
  $s = base64url_encode($sig);

  return "$h.$p.$s";
}

/**
 * @return array{header: array, payload: array}
 * @throws Exception
 */
function jwt_decode_verify(string $jwt, string $secret, ?string $expectedIssuer = null, ?string $expectedAudience = null): array {
  $parts = explode('.', $jwt);
  if (count($parts) !== 3) {
    throw new Exception('INVALID_TOKEN_FORMAT');
  }

  [$h64, $p64, $s64] = $parts;

  $headerJson = base64url_decode($h64);
  $payloadJson = base64url_decode($p64);

  $header = json_decode($headerJson, true);
  $payload = json_decode($payloadJson, true);

  if (!is_array($header) || !is_array($payload)) {
    throw new Exception('INVALID_TOKEN_JSON');
  }

  if (($header['alg'] ?? '') !== 'HS256') {
    throw new Exception('UNSUPPORTED_ALG');
  }

  $expectedSig = hash_hmac('sha256', "$h64.$p64", $secret, true);
  $sig = base64url_decode($s64);

  // comparaison timing-safe
  if (!hash_equals($expectedSig, $sig)) {
    throw new Exception('INVALID_SIGNATURE');
  }

  $now = time();

  if (isset($payload['exp']) && is_numeric($payload['exp']) && $now >= (int)$payload['exp']) {
    throw new Exception('TOKEN_EXPIRED');
  }

  if ($expectedIssuer && (($payload['iss'] ?? null) !== $expectedIssuer)) {
    throw new Exception('INVALID_ISSUER');
  }

  if ($expectedAudience && (($payload['aud'] ?? null) !== $expectedAudience)) {
    throw new Exception('INVALID_AUDIENCE');
  }

  return ['header' => $header, 'payload' => $payload];
}
