-- Phase 22: notifications and reminders.
-- Safe to re-run: setup skips columns, keys and tables that already exist.

ALTER TABLE notifications
  ADD COLUMN event_key VARCHAR(80) NULL AFTER user_id,
  ADD COLUMN read_at DATETIME NULL AFTER is_read;

ALTER TABLE notifications ADD KEY idx_notif_event (user_id, event_key);

-- Per-user choice for every event: both, email only, in-app only or off.
CREATE TABLE IF NOT EXISTS notification_preferences (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  event_key  VARCHAR(80) NOT NULL,
  mode       ENUM('both','email','in_app','off') NOT NULL DEFAULT 'both',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notif_pref (user_id, event_key),
  CONSTRAINT fk_notif_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Funder-configured reminder schedule per project.
ALTER TABLE projects
  ADD COLUMN reminders_enabled TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN reminder_days VARCHAR(60) NULL DEFAULT '14,7,1';

-- One row per reminder actually sent, so a reminder is never sent twice.
CREATE TABLE IF NOT EXISTS reminder_log (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id  BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  kind        VARCHAR(30) NOT NULL,
  days_before INT NOT NULL DEFAULT 0,
  closes_on   DATE NULL,
  sent_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reminder (project_id, user_id, kind, days_before, closes_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Weekly digest switch per organisation and its send log.
ALTER TABLE organizations ADD COLUMN weekly_digest TINYINT(1) NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS digest_log (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NOT NULL,
  week_key        VARCHAR(10) NOT NULL,
  sent_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_digest (organization_id, week_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Keep the message body so a failed email can be retried from the log.
ALTER TABLE email_logs
  ADD COLUMN body_html MEDIUMTEXT NULL,
  ADD COLUMN attempts INT NOT NULL DEFAULT 1,
  ADD COLUMN retried_at DATETIME NULL;
