-- Phase 24: review workflow 2.0 (reviewers, rubrics, stages, SLA, diff). Safe to re-run.

-- Rubric criteria per project (built in the funder UI).
CREATE TABLE IF NOT EXISTS review_criteria (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id    BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NULL,
  max_score     INT NOT NULL DEFAULT 5,
  weight        DECIMAL(6,2) NOT NULL DEFAULT 1.00,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rc_project (project_id, display_order),
  CONSTRAINT fk_rc_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Approval stages per project (e.g. Screening, Technical review, Final approval).
CREATE TABLE IF NOT EXISTS review_stages (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id       BIGINT UNSIGNED NOT NULL,
  name             VARCHAR(120) NOT NULL,
  display_order    INT NOT NULL DEFAULT 0,
  required_reviews INT NOT NULL DEFAULT 1,
  status           ENUM('active','inactive') NOT NULL DEFAULT 'active',
  KEY idx_rs_project (project_id, display_order),
  CONSTRAINT fk_rs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per reviewer per submission (per stage).
CREATE TABLE IF NOT EXISTS submission_reviewers (
  id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  submission_id  BIGINT UNSIGNED NOT NULL,
  user_id        BIGINT UNSIGNED NOT NULL,
  stage_id       BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status         ENUM('assigned','in_progress','completed','conflict') NOT NULL DEFAULT 'assigned',
  coi_declared   TINYINT(1) NOT NULL DEFAULT 0,
  coi_note       VARCHAR(500) NULL,
  recommendation ENUM('approve','changes','reject') NULL,
  summary        TEXT NULL,
  due_at         DATE NULL,
  overdue_notified TINYINT(1) NOT NULL DEFAULT 0,
  assigned_by    BIGINT UNSIGNED NULL,
  assigned_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at   DATETIME NULL,
  UNIQUE KEY uq_sub_reviewer (submission_id, user_id, stage_id),
  KEY idx_sr_user (user_id, status),
  CONSTRAINT fk_sr_sub FOREIGN KEY (submission_id) REFERENCES dmp_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_scores (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT UNSIGNED NOT NULL,
  criterion_id BIGINT UNSIGNED NOT NULL,
  score        DECIMAL(6,2) NULL,
  comment      TEXT NULL,
  UNIQUE KEY uq_score (assignment_id, criterion_id),
  CONSTRAINT fk_score_asg FOREIGN KEY (assignment_id) REFERENCES submission_reviewers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE dmp_submissions
  ADD COLUMN current_stage_id BIGINT UNSIGNED NULL,
  ADD COLUMN decision VARCHAR(20) NULL,
  ADD COLUMN decision_reason TEXT NULL;

-- Per-project review settings.
ALTER TABLE projects
  ADD COLUMN review_sla_days INT NOT NULL DEFAULT 14,
  ADD COLUMN review_anonymous TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN review_assign_mode ENUM('manual','round_robin') NOT NULL DEFAULT 'manual',
  ADD COLUMN reviewers_per_submission INT NOT NULL DEFAULT 1;
