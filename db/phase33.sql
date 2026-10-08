-- Phase 33: reviewer onboarding (funder invite + self sign-up), reviewer dashboard,
-- and double-blind review. Safe to re-run.

INSERT IGNORE INTO roles (code,name,scope,description,is_system)
VALUES ('reviewer','Panel Reviewer','funder','External reviewer invited by, or approved by, a funder',1);

ALTER TABLE user_tokens MODIFY COLUMN type ENUM('password_reset','email_verify','reviewer_invite') NOT NULL;

-- Review-specific profile. Identity (name, email, institution) stays on users /
-- this table and is only ever shown to funder administrators.
CREATE TABLE IF NOT EXISTS reviewer_profiles (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  organization_id BIGINT UNSIGNED NOT NULL,
  source          ENUM('funder_invite','self_signup') NOT NULL,
  status          ENUM('invited','pending','active','rejected','suspended') NOT NULL DEFAULT 'pending',
  expertise       VARCHAR(1000) NULL,
  institution     VARCHAR(255) NULL,
  orcid           VARCHAR(40) NULL,
  bio             TEXT NULL,
  coauthors       TEXT NULL,
  coi_declarations TEXT NULL,
  available       TINYINT(1) NOT NULL DEFAULT 1,
  confidentiality_accepted_at DATETIME NULL,
  decided_by      BIGINT UNSIGNED NULL,
  decided_at      DATETIME NULL,
  decision_note   VARCHAR(500) NULL,
  invited_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rp_user (user_id),
  KEY idx_rp_org (organization_id, status),
  CONSTRAINT fk_rp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Which calls (projects) a panel reviewer may be assigned to.
CREATE TABLE IF NOT EXISTS reviewer_calls (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  project_id  BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rc_pair (user_id, project_id),
  CONSTRAINT fk_rcall_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rcall_proj FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- The ONLY place that maps real assignments to pseudonyms.
CREATE TABLE IF NOT EXISTS anon_aliases (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  assignment_id     BIGINT UNSIGNED NOT NULL,
  submission_id     BIGINT UNSIGNED NOT NULL,
  application_alias VARCHAR(20) NOT NULL,
  reviewer_number   INT NOT NULL,
  reviewer_alias    VARCHAR(30) NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_alias_asg (assignment_id),
  KEY idx_alias_sub (submission_id),
  KEY idx_alias_app (application_alias),
  CONSTRAINT fk_alias_asg FOREIGN KEY (assignment_id) REFERENCES submission_reviewers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Proxied messages. channel 'funder' = reviewer <-> funder office (confidential);
-- channel 'applicant' = reviewer <-> applicant, both shown only by alias.
CREATE TABLE IF NOT EXISTS review_messages (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT UNSIGNED NOT NULL,
  channel       ENUM('funder','applicant') NOT NULL DEFAULT 'funder',
  sender_id     BIGINT UNSIGNED NOT NULL,
  sender_kind   ENUM('reviewer','funder','applicant') NOT NULL,
  body          TEXT NOT NULL,
  flagged       TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rm_asg (assignment_id, channel, created_at),
  CONSTRAINT fk_rm_asg FOREIGN KEY (assignment_id) REFERENCES submission_reviewers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Blinded proposal PDFs (metadata stripped on upload, stored outside public/).
CREATE TABLE IF NOT EXISTS blinded_documents (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id   BIGINT UNSIGNED NOT NULL,
  stored_name   VARCHAR(120) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL DEFAULT 0,
  metadata_removed INT NOT NULL DEFAULT 0,
  flags         TEXT NULL,
  uploaded_by   BIGINT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bd_resp (response_id),
  CONSTRAINT fk_bd_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Extra review workspace fields + release control.
ALTER TABLE submission_reviewers
  ADD COLUMN strengths TEXT NULL,
  ADD COLUMN weaknesses TEXT NULL,
  ADD COLUMN funder_comment TEXT NULL,
  ADD COLUMN applicant_comment TEXT NULL,
  ADD COLUMN released_at DATETIME NULL,
  ADD COLUMN released_by BIGINT UNSIGNED NULL,
  ADD COLUMN due_soon_notified TINYINT(1) NOT NULL DEFAULT 0;

-- Per-call blinding settings.
ALTER TABLE projects
  ADD COLUMN review_blind_mode ENUM('none','single','double') NOT NULL DEFAULT 'double',
  ADD COLUMN review_applicant_messages TINYINT(1) NOT NULL DEFAULT 0;

-- Funder-level switch: may reviewers apply to this funder themselves?
ALTER TABLE organizations
  ADD COLUMN reviewer_self_signup TINYINT(1) NOT NULL DEFAULT 1;
