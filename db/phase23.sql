-- Phase 23: collaboration on a DMP (co-authors, roles, assignments,
-- internal comments, section locks, activity feed). Safe to re-run.

CREATE TABLE IF NOT EXISTS dmp_collaborators (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id  BIGINT UNSIGNED NOT NULL,
  user_id      BIGINT UNSIGNED NULL,
  email        VARCHAR(190) NOT NULL,
  role         ENUM('editor','commenter','viewer') NOT NULL DEFAULT 'editor',
  status       ENUM('pending','accepted','revoked') NOT NULL DEFAULT 'pending',
  invite_token CHAR(48) NOT NULL,
  invited_by   BIGINT UNSIGNED NULL,
  accepted_at  DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_collab_token (invite_token),
  UNIQUE KEY uq_collab_email (response_id, email),
  KEY idx_collab_user (user_id, status),
  CONSTRAINT fk_collab_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_section_assignments (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id BIGINT UNSIGNED NOT NULL,
  section_id  BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_assign (response_id, section_id),
  CONSTRAINT fk_assign_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_internal_comments (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id      BIGINT UNSIGNED NOT NULL,
  project_field_id BIGINT UNSIGNED NULL,
  parent_id        BIGINT UNSIGNED NULL,
  user_id          BIGINT UNSIGNED NOT NULL,
  comment          TEXT NOT NULL,
  status           ENUM('open','resolved') NOT NULL DEFAULT 'open',
  resolved_by      BIGINT UNSIGNED NULL,
  resolved_at      DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ic_resp (response_id, project_field_id),
  CONSTRAINT fk_ic_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_section_locks (
  response_id BIGINT UNSIGNED NOT NULL,
  section_id  BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  expires_at  DATETIME NOT NULL,
  PRIMARY KEY (response_id, section_id),
  CONSTRAINT fk_lock_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_activity (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(60) NOT NULL,
  details     VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_act_resp (response_id, created_at),
  CONSTRAINT fk_act_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Who changed each answer last (shown in the activity feed and on fields).
ALTER TABLE dmp_response_values ADD COLUMN updated_by BIGINT UNSIGNED NULL;
