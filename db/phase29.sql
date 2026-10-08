-- Phase 29: public API keys, webhooks and delivery logs. Safe to re-run.

CREATE TABLE IF NOT EXISTS api_keys (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,          -- NULL = platform-wide key (Super Admin)
  name            VARCHAR(120) NOT NULL,
  key_prefix      VARCHAR(24) NOT NULL,
  key_hash        CHAR(64) NOT NULL,
  scopes          VARCHAR(500) NOT NULL DEFAULT '',
  rate_limit_per_min INT UNSIGNED NOT NULL DEFAULT 60,
  expires_at      DATETIME NULL,
  last_used_at    DATETIME NULL,
  last_used_ip    VARCHAR(64) NULL,
  request_count   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  revoked_at      DATETIME NULL,
  created_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_api_key_prefix (key_prefix),
  KEY idx_api_key_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webhooks (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,          -- NULL = receives events from every organization
  name            VARCHAR(120) NOT NULL,
  url             VARCHAR(500) NOT NULL,
  secret_enc      TEXT NOT NULL,
  events          VARCHAR(1000) NOT NULL DEFAULT '*',
  status          ENUM('active','paused') NOT NULL DEFAULT 'active',
  failure_count   INT UNSIGNED NOT NULL DEFAULT 0,
  created_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_webhook_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  webhook_id      BIGINT UNSIGNED NOT NULL,
  event_id        VARCHAR(40) NOT NULL,
  event_key       VARCHAR(80) NOT NULL,
  payload         MEDIUMTEXT NOT NULL,
  status          ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  attempts        INT UNSIGNED NOT NULL DEFAULT 0,
  response_code   INT NULL,
  response_body   VARCHAR(1000) NULL,
  error_message   VARCHAR(500) NULL,
  next_attempt_at DATETIME NULL,
  delivered_at    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_wd_hook (webhook_id, created_at),
  KEY idx_wd_due (status, next_attempt_at),
  CONSTRAINT fk_wd_hook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
