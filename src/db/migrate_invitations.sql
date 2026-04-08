-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : table user_invitations
-- Stocke les tokens d'activation de compte envoyés par mail
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_invitations (
  id         int(11)      NOT NULL AUTO_INCREMENT,
  user_uuid  uuid         NOT NULL,
  token      char(64)     NOT NULL,
  expires_at datetime     NOT NULL,
  used_at    datetime     NULL DEFAULT NULL,
  created_at datetime     NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_token (token),
  KEY idx_inv_user (user_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
