-- Phase 34: performance & accessibility groundwork. Safe to re-run.
--   1. background_jobs  - queue for email, bulk ZIP exports (PDF/Word/maDMP) and future slow work
--   2. cache_versions   - tells every app process when cached pages/translations must refresh
--   3. slow_queries     - database queries slower than SLOW_QUERY_MS, for the Performance page
--   4. indexes          - from the slow-query review, ahead of multi-funder load

CREATE TABLE IF NOT EXISTS background_jobs (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  job_type        VARCHAR(60) NOT NULL,
  label           VARCHAR(200) NULL,
  payload         LONGTEXT NULL,
  status          ENUM('queued','running','done','failed','cancelled') NOT NULL DEFAULT 'queued',
  priority        TINYINT UNSIGNED NOT NULL DEFAULT 5,
  attempts        INT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts    INT UNSIGNED NOT NULL DEFAULT 5,
  run_after       DATETIME NOT NULL,
  locked_by       VARCHAR(80) NULL,
  locked_until    DATETIME NULL,
  last_error      VARCHAR(1000) NULL,
  result          LONGTEXT NULL,
  organization_id BIGINT UNSIGNED NULL,
  created_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at      DATETIME NULL,
  finished_at     DATETIME NULL,
  KEY idx_job_due (status, run_after, priority),
  KEY idx_job_lock (status, locked_until),
  KEY idx_job_org (organization_id, job_type, id),
  KEY idx_job_finished (status, finished_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cache_versions (
  namespace   VARCHAR(40) PRIMARY KEY,
  version     BIGINT UNSIGNED NOT NULL DEFAULT 1,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS slow_queries (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fingerprint CHAR(40) NOT NULL,
  sample_sql  TEXT NOT NULL,
  calls       INT UNSIGNED NOT NULL DEFAULT 1,
  total_ms    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  max_ms      INT UNSIGNED NOT NULL DEFAULT 0,
  last_path   VARCHAR(255) NULL,
  first_seen  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slow_fp (fingerprint),
  KEY idx_slow_max (max_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---- Index review -------------------------------------------------------
-- Latest version of each plan: WHERE response_id=? ORDER BY version / MAX(version)
CREATE INDEX idx_sub_resp_ver ON dmp_submissions (response_id, version);
-- Review queues, dashboards and reports filter by status and sort by date
CREATE INDEX idx_sub_status ON dmp_submissions (status, submitted_at);
CREATE INDEX idx_sub_stage ON dmp_submissions (current_stage_id);
-- Per-call plan lists and progress counts
CREATE INDEX idx_resp_project_status ON dmp_responses (project_id, status);
-- Public plan links (/plans/<token>)
CREATE INDEX idx_resp_token ON dmp_responses (public_token);
CREATE INDEX idx_resp_visibility ON dmp_responses (visibility, published_at);
-- Funder/institution call lists
CREATE INDEX idx_project_org_status ON projects (organization_id, status, created_at);
-- Notification centre (newest first per user)
CREATE INDEX idx_notif_user_created ON notifications (user_id, created_at);
-- Email delivery log filters
CREATE INDEX idx_maillog_status ON email_logs (status, created_at);
-- Audit log per organisation / per action
CREATE INDEX idx_audit_org ON audit_logs (organization_id, created_at);
CREATE INDEX idx_audit_action ON audit_logs (action, created_at);
-- Users list per organisation and role
CREATE INDEX idx_user_org_role ON users (organization_id, role_id);
-- Form loading: sections in order
CREATE INDEX idx_fs_project_order ON form_sections (project_id, display_order);
