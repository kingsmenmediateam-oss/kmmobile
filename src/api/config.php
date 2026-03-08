<?php
// config.php

declare(strict_types=1);

return [
  // IMPORTANT: change ça en prod (clé longue, aléatoire, secrète)
  'jwt_secret' => 'h8ehqhQF6jYJzDAjyhFghiDmzm3VEPxhXjvUv5XMBPrerLaKLMfvXGXYp002mmHB',
  'jwt_issuer' => 'carecode.be',
  'jwt_audience' => 'kmmobile',
  'jwt_ttl_seconds' => 60 * 60 * 6, // 6 heures

  // DB (exemple MySQL)
  'db' => [
    'dsn' => 'mysql:host=127.0.0.1;dbname=carec1650622_6wwfgq;charset=utf8mb4',
    'user' => 'carec1650622',
    'pass' => 'n1s2w7u4ht',
  ],
];
