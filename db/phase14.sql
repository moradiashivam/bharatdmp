-- =====================================================================
-- PHASE 14 - Notifications, per-organisation SMTP, password reset,
--            email verification and per-project landing customisation.
-- Safe to run on an existing database:  npm run db:upgrade
-- =====================================================================

-- ---------------------------------------------------------------------
-- Per-organisation (funder / institution) SMTP configuration.
-- When smtp_enabled = 0 the platform-wide (owner) SMTP is used instead.
-- ---------------------------------------------------------------------
ALTER TABLE organizations
  ADD COLUMN smtp_enabled    TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN smtp_host       VARCHAR(190) NULL,
  ADD COLUMN smtp_port       INT UNSIGNED NULL,
  ADD COLUMN smtp_secure     TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN smtp_user       VARCHAR(190) NULL,
  ADD COLUMN smtp_password   VARCHAR(255) NULL,
  ADD COLUMN mail_from_email VARCHAR(190) NULL,
  ADD COLUMN mail_from_name  VARCHAR(190) NULL,
  ADD COLUMN notify_emails   VARCHAR(500) NULL,
  ADD COLUMN email_signature TEXT NULL;

-- ---------------------------------------------------------------------
-- Per-project public landing page customisation (logo, colours, copy).
-- Falls back to the organisation branding when left empty.
-- ---------------------------------------------------------------------
ALTER TABLE projects
  ADD COLUMN logo            VARCHAR(255) NULL,
  ADD COLUMN primary_color   VARCHAR(20)  NULL,
  ADD COLUMN secondary_color VARCHAR(20)  NULL,
  ADD COLUMN page_heading    VARCHAR(255) NULL,
  ADD COLUMN page_intro      TEXT NULL,
  ADD COLUMN support_email   VARCHAR(190) NULL,
  ADD COLUMN support_phone   VARCHAR(50)  NULL,
  ADD COLUMN extra_details   MEDIUMTEXT NULL,
  ADD COLUMN show_org_logo   TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN start_button_label VARCHAR(120) NULL;

-- ---------------------------------------------------------------------
-- One-time tokens: password reset + email verification.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_tokens (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  type       ENUM('password_reset','email_verify') NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at    DATETIME NULL,
  created_ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_token_hash (token_hash),
  KEY idx_token_user (user_id, type),
  CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Editable notification templates.  organization_id = 0 means the
-- platform-wide (owner) template; a funder/institution row overrides it.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_templates (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
  event_key       VARCHAR(80) NOT NULL,
  subject         VARCHAR(255) NOT NULL,
  body_html       MEDIUMTEXT NOT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_template (organization_id, event_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Delivery log for every outgoing message (any channel).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_logs (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,
  event_key       VARCHAR(80) NULL,
  channel         VARCHAR(30) NOT NULL DEFAULT 'email',
  recipient       VARCHAR(255) NOT NULL,
  subject         VARCHAR(255) NULL,
  status          ENUM('sent','failed','skipped') NOT NULL,
  error_message   VARCHAR(500) NULL,
  smtp_source     VARCHAR(30) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_maillog_org (organization_id, created_at),
  KEY idx_maillog_event (event_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Future channels (SMS / WhatsApp) reuse the notifications table.
ALTER TABLE notifications
  MODIFY COLUMN channel ENUM('web','email','sms','whatsapp') NOT NULL DEFAULT 'web';
