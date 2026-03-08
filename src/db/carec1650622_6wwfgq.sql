-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 04 mars 2026 à 15:06
-- Version du serveur : 10.11.15-MariaDB-deb12
-- Version de PHP : 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `carec1650622_6wwfgq`
--

-- --------------------------------------------------------

--
-- Structure de la table `chat_messages`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `room_id`, `user_id`, `text`, `created_at`) VALUES
(1, 1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'Bienvenue dans la Cantina 👋', '2026-01-30 13:52:33'),
(2, 1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'Ici on discute entre Kingsmen 😄', '2026-01-30 13:52:38'),
(3, 1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'Salut la mife', '2026-01-30 13:55:35'),
(4, 1, 'system', '🛡️ Le système a créé le salon Cantina.', '2026-01-30 14:42:16'),
(5, 1, 'system', 'ℹ️ Règle: soyez courtois et concis.', '2026-01-30 14:42:26'),
(6, 1, 'system', '✅ Maintenance terminée. Merci pour votre patience.', '2026-01-30 14:42:36'),
(7, 1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'Vive l\'Amour', '2026-01-30 14:42:37'),
(8, 2, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'Hello', '2026-01-30 17:19:33'),
(9, 3, 'system', 'Emergency room is active. Use this room for urgent help requests.', '2026-03-04 18:56:00');

-- --------------------------------------------------------

--
-- Structure de la table `chat_rooms`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `chat_rooms`;
CREATE TABLE `chat_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `event_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `chat_rooms`
--

INSERT INTO `chat_rooms` (`id`, `name`, `description`, `is_public`, `created_at`, `event_id`) VALUES
(1, 'Cantina', 'Salon de discussion Cantina', 0, '2026-01-30 13:52:33', NULL),
(2, 'Km Awaken 2026', 'Pour les participants à l\'Awaken', 0, '2026-01-30 16:07:07', 1),
(3, 'emergency room', 'Emergency alerts and rapid response', 0, '2026-03-04 18:55:00', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `chat_room_members`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `chat_room_members`;
CREATE TABLE `chat_room_members` (
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `role` enum('member','admin') NOT NULL DEFAULT 'member',
  `last_read_at` datetime DEFAULT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `chat_room_members`
--

INSERT INTO `chat_room_members` (`room_id`, `user_id`, `role`, `last_read_at`, `joined_at`) VALUES
(1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'admin', '2026-03-04 16:06:46', '2026-01-30 13:52:33'),
(2, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'member', '2026-01-30 17:27:32', '2026-01-30 17:08:14'),
(3, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'member', NULL, '2026-03-04 18:55:00');

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `events`
--

INSERT INTO `events` (`id`, `name`, `starts_at`, `ends_at`, `created_at`) VALUES
(1, 'Km Awaken 2026', '2026-06-01 09:00:00', '2026-06-03 18:00:00', '2026-01-30 16:07:07'),
(2, 'Kingsmen Summit 2026', '2026-09-12 09:30:00', '2026-09-13 17:00:00', '2026-03-04 16:24:00');

-- --------------------------------------------------------

--
-- Structure de la table `calendar_events`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `title`, `description`, `event_date`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'Réunion Kingsmen', 'Réunion mensuelle de tous les Kingsmen', '2026-03-15', '18:00:00', '20:00:00', '2026-03-04 15:06:00', '2026-03-04 15:06:00'),
(2, 'Formation Initiation', 'Formation pour les nouveaux membres', '2026-03-22', '10:00:00', '12:00:00', '2026-03-04 15:06:00', '2026-03-04 15:06:00'),
(3, 'Km Awaken 2026', 'Grand événement annuel des Kingsmen', '2026-06-01', '09:00:00', '22:00:00', '2026-03-04 15:06:00', '2026-03-04 15:06:00');

-- --------------------------------------------------------

--
-- Structure de la table `event_users`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `event_users`;
CREATE TABLE `event_users` (
  `event_id` int(11) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'attendee',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `event_users`
--

INSERT INTO `event_users` (`event_id`, `user_id`, `role`, `created_at`) VALUES
(1, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'attendee', '2026-01-30 16:11:37'),
(2, '02110b33-fd30-11f0-bbea-00163ef6ee59', 'attendee', '2026-03-04 16:24:30');

-- --------------------------------------------------------

--
-- Structure de la table `event_info_items`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `event_info_items`;
CREATE TABLE `event_info_items` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `item_type` enum('pin','song','file','poll') NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `poll_options_json` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `event_info_items`
--

INSERT INTO `event_info_items` (`id`, `event_id`, `item_type`, `title`, `body`, `file_url`, `poll_options_json`, `sort_order`, `created_at`) VALUES
(1, 1, 'pin', 'Arrival instructions', 'Check-in starts at 08:00 at the main entrance. Bring your QR pass and a valid ID.', NULL, NULL, 10, '2026-03-04 16:20:00'),
(2, 1, 'song', 'Opening anthem', 'Rise together, stand as one,\nKingsmen united until the day is done.', NULL, NULL, 20, '2026-03-04 16:21:00'),
(3, 1, 'file', 'Event handbook PDF', 'Download the official handbook before arrival.', 'https://carecode.be/kmmobile/files/km-awaken-2026-handbook.pdf', NULL, 30, '2026-03-04 16:22:00'),
(4, 1, 'poll', 'Preferred workshop track', 'Vote for your favorite workshop track.', NULL, '[\"Leadership\",\"Operations\",\"Creativity\"]', 40, '2026-03-04 16:23:00'),
(5, 2, 'pin', 'Welcome briefing', 'The welcome briefing starts at 09:30 in Hall B.', NULL, NULL, 10, '2026-03-04 16:25:00'),
(6, 2, 'file', 'Summit schedule PDF', 'Review the full schedule before day one.', 'https://carecode.be/kmmobile/files/kingsmen-summit-2026-schedule.pdf', NULL, 20, '2026-03-04 16:26:00');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `uuid` uuid NOT NULL DEFAULT uuid(),
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `birthday` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`uuid`, `username`, `password_hash`, `is_active`, `firstname`, `lastname`, `email`, `birthday`) VALUES
('02110b33-fd30-11f0-bbea-00163ef6ee59', 'etienne.darquennes@gmail.com', '$2y$10$4CPwXRpFZw1T/ECSuyMxN...ThQ/kA3H1x5Jznl/Ccsy6F7mkcxQy', 1, 'Etienne', 'Darquennes', 'etienne.darquennes@gmail.com', '1971-05-19'),
('47632ec0-fde1-11f0-bbea-00163ef6ee59', 'system', '$2y$10$sKYXEPr2tQtwK7GuLDUydOlnqBMoqETB4HVBAXxpJ6zuVx5nGzX3i', 1, 'system', 'system', '[value-7]', '0000-00-00');

--
-- Index pour la table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_event_date_time` (`event_date`,`start_time`);

--
-- Index pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room_created` (`room_id`,`created_at`),
  ADD KEY `idx_room_id` (`room_id`,`id`);

--
-- Index pour la table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_rooms_event_id` (`event_id`);

--
-- Index pour la table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD PRIMARY KEY (`room_id`,`user_id`);

--
-- Index pour la table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `event_users`
--
ALTER TABLE `event_users`
  ADD PRIMARY KEY (`event_id`,`user_id`);

--
-- Index pour la table `event_info_items`
--
ALTER TABLE `event_info_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_info_event` (`event_id`),
  ADD KEY `idx_event_info_type` (`item_type`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `event_info_items`
--
ALTER TABLE `event_info_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_msg_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD CONSTRAINT `fk_chat_rooms_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD CONSTRAINT `fk_member_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `event_users`
--
ALTER TABLE `event_users`
  ADD CONSTRAINT `fk_event_users_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `event_info_items`
--
ALTER TABLE `event_info_items`
  ADD CONSTRAINT `fk_event_info_items_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
