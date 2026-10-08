-- Phase 25: identity and sign-in (ORCID / Google / Microsoft, 2FA, sessions,
-- password policy). Safe to re-run.

-- Sign-in providers configured by the Super Admin (secrets stored encrypted).
CREATE TABLE IF NOT EXISTS auth_providers (
  code            VARCHAR(30) PRIMARY KEY,
  name            VARCHAR(80) NOT NULL,
  enabled         TINYINT(1) NOT NULL DEFAULT 0,
  client_id       VARCHAR(255) NULL,
  client_secret   TEXT NULL,
  tenant          VARCHAR(120) NULL,
  sandbox         TINYINT(1) NOT NULL DEFAULT 0,
  allowed_domains VARCHAR(500) NULL,
  auto_create     TINYINT(1) NOT NULL DEFAULT 1,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO auth_providers (code,name) VALUES ('orcid','ORCID'),('google','Google'),('microsoft','Microsoft');

-- External identities linked to local accounts.
CREATE TABLE IF NOT EXISTS user_identities (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  provider   VARCHAR(30) NOT NULL,
  subject    VARCHAR(190) NOT NULL,
  email      VARCHAR(190) NULL,
  linked_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME NULL,
  UNIQUE KEY uq_identity (provider, subject),
  UNIQUE KEY uq_user_provider (user_id, provider),
  CONSTRAINT fk_identity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Two-factor authentication (TOTP).
ALTER TABLE users
  ADD COLUMN totp_secret TEXT NULL,
  ADD COLUMN totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN totp_enabled_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS user_recovery_codes (
  id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id   BIGINT UNSIGNED NOT NULL,
  code_hash CHAR(64) NOT NULL,
  used_at   DATETIME NULL,
  KEY idx_recovery_user (user_id),
  CONSTRAINT fk_recovery_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Active sessions a user can see and revoke.
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  ip         VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  method     VARCHAR(30) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  KEY idx_us_user (user_id, revoked_at),
  CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-organisation sign-in rules.
ALTER TABLE organizations
  ADD COLUMN login_methods VARCHAR(100) NOT NULL DEFAULT 'password,google,microsoft,orcid',
  ADD COLUMN require_2fa TINYINT(1) NOT NULL DEFAULT 0;

-- Platform security settings (editable under Sign-in & Security).
INSERT IGNORE INTO system_settings (setting_group,setting_key,setting_value) VALUES
  ('security','require_2fa_roles',''),
  ('security','password_min_length','8'),
  ('security','password_require_mixed_case','0'),
  ('security','password_require_number','1'),
  ('security','password_require_symbol','0'),
  ('security','captcha_adaptive','0');
