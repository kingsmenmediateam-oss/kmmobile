<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require __DIR__ . '/db.php';

$payload = require_auth();
$userId = (string)($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? '');
if ($userId === '') {
  json_error(401, 'UNAUTHORIZED', 'Token payload missing user id');
}

$pdo = db();

// Get action parameter
$action = $_GET['action'] ?? '';

/**
 * Get events for a specific month
 */
if ($action === 'getByMonth') {
  $year = (int)($_GET['year'] ?? date('Y'));
  $month = (int)($_GET['month'] ?? date('m'));

  // Validate month
  if ($month < 1 || $month > 12) {
    json_error(400, 'BAD_REQUEST', 'Invalid month');
  }

  $firstDay = date('Y-m-d', mktime(0, 0, 0, $month, 1, $year));
  $lastDay = date('Y-m-d', mktime(0, 0, 0, $month + 1, 0, $year));

  $sql = "
    SELECT
      id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM calendar_events
    WHERE event_date >= :firstDay
      AND event_date <= :lastDay
    ORDER BY event_date ASC, start_time ASC
  ";

  $st = $pdo->prepare($sql);
  $st->execute([
    ':firstDay' => $firstDay,
    ':lastDay' => $lastDay,
  ]);

  $events = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $events[] = [
      'id' => (int)$row['id'],
      'title' => (string)$row['title'],
      'description' => (string)$row['description'],
      'event_date' => (string)$row['event_date'],
      'start_time' => (string)$row['start_time'],
      'end_time' => (string)$row['end_time'],
      'created_at' => (string)$row['created_at'],
      'updated_at' => (string)$row['updated_at'],
    ];
  }

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($events, JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Get events for a specific date
 */
if ($action === 'getByDate') {
  $date = $_GET['date'] ?? '';

  // Validate date format
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_error(400, 'BAD_REQUEST', 'Invalid date format. Use YYYY-MM-DD');
  }

  $sql = "
    SELECT
      id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM calendar_events
    WHERE event_date = :date
    ORDER BY start_time ASC
  ";

  $st = $pdo->prepare($sql);
  $st->execute([':date' => $date]);

  $events = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $events[] = [
      'id' => (int)$row['id'],
      'title' => (string)$row['title'],
      'description' => (string)$row['description'],
      'event_date' => (string)$row['event_date'],
      'start_time' => (string)$row['start_time'],
      'end_time' => (string)$row['end_time'],
      'created_at' => (string)$row['created_at'],
      'updated_at' => (string)$row['updated_at'],
    ];
  }

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($events, JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Get a specific event by ID
 */
if ($action === 'get') {
  $id = (int)($_GET['id'] ?? 0);

  if ($id <= 0) {
    json_error(400, 'BAD_REQUEST', 'Invalid event ID');
  }

  $sql = "
    SELECT
      id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM calendar_events
    WHERE id = :id
  ";

  $st = $pdo->prepare($sql);
  $st->execute([':id' => $id]);

  $row = $st->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    json_error(404, 'NOT_FOUND', 'Event not found');
  }

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'id' => (int)$row['id'],
    'title' => (string)$row['title'],
    'description' => (string)$row['description'],
    'event_date' => (string)$row['event_date'],
    'start_time' => (string)$row['start_time'],
    'end_time' => (string)$row['end_time'],
    'created_at' => (string)$row['created_at'],
    'updated_at' => (string)$row['updated_at'],
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Get upcoming events (next 30 days)
 */
if ($action === 'getUpcoming') {
  $today = date('Y-m-d');
  $nextMonth = date('Y-m-d', strtotime('+30 days'));

  $sql = "
    SELECT
      id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM calendar_events
    WHERE event_date >= :today
      AND event_date <= :nextMonth
    ORDER BY event_date ASC, start_time ASC
  ";

  $st = $pdo->prepare($sql);
  $st->execute([
    ':today' => $today,
    ':nextMonth' => $nextMonth,
  ]);

  $events = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $events[] = [
      'id' => (int)$row['id'],
      'title' => (string)$row['title'],
      'description' => (string)$row['description'],
      'event_date' => (string)$row['event_date'],
      'start_time' => (string)$row['start_time'],
      'end_time' => (string)$row['end_time'],
      'created_at' => (string)$row['created_at'],
      'updated_at' => (string)$row['updated_at'],
    ];
  }

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($events, JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Create a new event (Admin only)
 */
if ($action === 'create') {
  // Check admin role (you may adjust this based on your auth system)
  $isAdmin = (bool)($payload['role'] === 'admin' || $payload['is_admin'] === true);
  if (!$isAdmin) {
    json_error(403, 'FORBIDDEN', 'Only admins can create events');
  }

  $data = json_decode(file_get_contents('php://input'), true);

  // Validate required fields
  if (empty($data['title']) || empty($data['event_date']) || empty($data['start_time']) || empty($data['end_time'])) {
    json_error(400, 'BAD_REQUEST', 'Missing required fields: title, event_date, start_time, end_time');
  }

  $title = trim((string)$data['title']);
  $description = trim((string)($data['description'] ?? ''));
  $eventDate = (string)$data['event_date'];
  $startTime = (string)$data['start_time'];
  $endTime = (string)$data['end_time'];

  // Validate date and time formats
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate)) {
    json_error(400, 'BAD_REQUEST', 'Invalid event_date format. Use YYYY-MM-DD');
  }

  if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $startTime) || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $endTime)) {
    json_error(400, 'BAD_REQUEST', 'Invalid time format. Use HH:MM or HH:MM:SS');
  }

  $sql = "
    INSERT INTO calendar_events (title, description, event_date, start_time, end_time, created_at, updated_at)
    VALUES (:title, :description, :eventDate, :startTime, :endTime, NOW(), NOW())
  ";

  $st = $pdo->prepare($sql);
  $result = $st->execute([
    ':title' => $title,
    ':description' => $description,
    ':eventDate' => $eventDate,
    ':startTime' => $startTime,
    ':endTime' => $endTime,
  ]);

  if (!$result) {
    json_error(500, 'DATABASE_ERROR', 'Failed to create event');
  }

  $eventId = (int)$pdo->lastInsertId();

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'id' => $eventId,
    'title' => $title,
    'description' => $description,
    'event_date' => $eventDate,
    'start_time' => $startTime,
    'end_time' => $endTime,
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s'),
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Update an event (Admin only)
 */
if ($action === 'update') {
  // Check admin role
  $isAdmin = (bool)($payload['role'] === 'admin' || $payload['is_admin'] === true);
  if (!$isAdmin) {
    json_error(403, 'FORBIDDEN', 'Only admins can update events');
  }

  $id = (int)($_GET['id'] ?? 0);
  if ($id <= 0) {
    json_error(400, 'BAD_REQUEST', 'Invalid event ID');
  }

  $data = json_decode(file_get_contents('php://input'), true);

  // Check if event exists
  $sql = "SELECT id FROM calendar_events WHERE id = :id";
  $st = $pdo->prepare($sql);
  $st->execute([':id' => $id]);
  if (!$st->fetch()) {
    json_error(404, 'NOT_FOUND', 'Event not found');
  }

  // Build update query dynamically
  $updates = [];
  $params = [':id' => $id];

  if (isset($data['title']) && !empty($data['title'])) {
    $updates[] = "title = :title";
    $params[':title'] = trim((string)$data['title']);
  }

  if (isset($data['description'])) {
    $updates[] = "description = :description";
    $params[':description'] = trim((string)$data['description']);
  }

  if (isset($data['event_date'])) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['event_date'])) {
      json_error(400, 'BAD_REQUEST', 'Invalid event_date format. Use YYYY-MM-DD');
    }
    $updates[] = "event_date = :eventDate";
    $params[':eventDate'] = (string)$data['event_date'];
  }

  if (isset($data['start_time'])) {
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['start_time'])) {
      json_error(400, 'BAD_REQUEST', 'Invalid start_time format. Use HH:MM or HH:MM:SS');
    }
    $updates[] = "start_time = :startTime";
    $params[':startTime'] = (string)$data['start_time'];
  }

  if (isset($data['end_time'])) {
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['end_time'])) {
      json_error(400, 'BAD_REQUEST', 'Invalid end_time format. Use HH:MM or HH:MM:SS');
    }
    $updates[] = "end_time = :endTime";
    $params[':endTime'] = (string)$data['end_time'];
  }

  if (empty($updates)) {
    json_error(400, 'BAD_REQUEST', 'No fields to update');
  }

  $updates[] = "updated_at = NOW()";
  $sql = "UPDATE calendar_events SET " . implode(", ", $updates) . " WHERE id = :id";

  $st = $pdo->prepare($sql);
  $st->execute($params);

  // Fetch and return updated event
  $sql = "
    SELECT
      id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM calendar_events
    WHERE id = :id
  ";

  $st = $pdo->prepare($sql);
  $st->execute([':id' => $id]);
  $row = $st->fetch(PDO::FETCH_ASSOC);

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'id' => (int)$row['id'],
    'title' => (string)$row['title'],
    'description' => (string)$row['description'],
    'event_date' => (string)$row['event_date'],
    'start_time' => (string)$row['start_time'],
    'end_time' => (string)$row['end_time'],
    'created_at' => (string)$row['created_at'],
    'updated_at' => (string)$row['updated_at'],
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

/**
 * Delete an event (Admin only)
 */
if ($action === 'delete') {
  // Check admin role
  $isAdmin = (bool)($payload['role'] === 'admin' || $payload['is_admin'] === true);
  if (!$isAdmin) {
    json_error(403, 'FORBIDDEN', 'Only admins can delete events');
  }

  $id = (int)($_GET['id'] ?? 0);
  if ($id <= 0) {
    json_error(400, 'BAD_REQUEST', 'Invalid event ID');
  }

  // Check if event exists
  $sql = "SELECT id FROM calendar_events WHERE id = :id";
  $st = $pdo->prepare($sql);
  $st->execute([':id' => $id]);
  if (!$st->fetch()) {
    json_error(404, 'NOT_FOUND', 'Event not found');
  }

  // Delete event
  $sql = "DELETE FROM calendar_events WHERE id = :id";
  $st = $pdo->prepare($sql);
  $st->execute([':id' => $id]);

  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
  exit;
}

// Unknown action
json_error(400, 'BAD_REQUEST', 'Unknown or missing action');
