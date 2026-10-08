-- Phase 32: FAIRsharing lookup, sending plans to repositories, ORCID works. Safe to re-run.

INSERT IGNORE INTO field_types (code,name,input_kind,has_options,display_order) VALUES
  ('metadata_standard','Metadata Standard (FAIRsharing lookup)','lookup',0,35),
  ('publication_picker','Publication (from my ORCID works)','lookup',0,36);

-- A researcher's own repository accounts (token stored encrypted).
CREATE TABLE IF NOT EXISTS repository_accounts (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  kind        ENUM('zenodo','dataverse','figshare','dspace') NOT NULL,
  base_url    VARCHAR(500) NULL,
  token_enc   TEXT NULL,
  extra       TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_repo_acct (user_id, kind),
  CONSTRAINT fk_repo_acct_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Every attempt to send a plan to a repository.
CREATE TABLE IF NOT EXISTS dmp_deposits (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  kind        VARCHAR(20) NOT NULL,
  version     INT NULL,
  status      ENUM('draft','published','failed') NOT NULL DEFAULT 'draft',
  remote_id   VARCHAR(190) NULL,
  doi         VARCHAR(255) NULL,
  url         VARCHAR(500) NULL,
  message     VARCHAR(1000) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_dep_resp (response_id),
  CONSTRAINT fk_dep_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Publications imported from a researcher's public ORCID record.
CREATE TABLE IF NOT EXISTS researcher_works (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  put_code    VARCHAR(40) NOT NULL,
  title       VARCHAR(1000) NOT NULL,
  work_type   VARCHAR(60) NULL,
  year        VARCHAR(10) NULL,
  journal     VARCHAR(500) NULL,
  doi         VARCHAR(255) NULL,
  url         VARCHAR(500) NULL,
  imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_work (user_id, put_code),
  CONSTRAINT fk_work_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Phase 32: AI assistance (opt-in per organization).
ALTER TABLE organizations ADD COLUMN ai_enabled TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,
  user_id         BIGINT UNSIGNED NULL,
  feature         VARCHAR(30) NOT NULL,
  ok              TINYINT(1) NOT NULL DEFAULT 1,
  chars_in        INT NOT NULL DEFAULT 0,
  chars_out       INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ai_org (organization_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
