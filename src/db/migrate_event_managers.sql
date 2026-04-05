-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : rôle event_manager + table event_managers
-- À exécuter une seule fois sur le serveur MySQL/MariaDB
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. users.uuid n'a pas de PRIMARY KEY dans le schéma d'origine.
--    On l'ajoute ici pour permettre les FK (et pour la cohérence de la table).
ALTER TABLE users ADD PRIMARY KEY (uuid);

-- 2. Créer la table de liaison event_managers
--    • event_id  : int(11)  — correspond exactement à events.id
--    • user_uuid : uuid     — correspond exactement à users.uuid (type natif MariaDB)
--    • Pas de FK sur user_uuid car le type uuid peut varier selon la version ;
--      l'intégrité est garantie par le backend PHP.
CREATE TABLE IF NOT EXISTS event_managers (
  event_id   int(11)   NOT NULL,
  user_uuid  uuid      NOT NULL,
  created_at datetime  NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (event_id, user_uuid),
  CONSTRAINT fk_em_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Index pour les recherches par user_uuid
CREATE INDEX idx_em_user ON event_managers (user_uuid);

-- 3. Promouvoir les membres existants en event_manager
--    (exclut le compte système)
UPDATE users
  SET role = 'event_manager'
  WHERE role = 'member'
    AND username != 'system';
