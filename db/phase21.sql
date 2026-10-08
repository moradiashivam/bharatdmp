-- Phase 21: languages, translations and multilingual DMP answers.
-- Existing single-language answers stay in dmp_response_values and count as
-- the default-language answer, so no data has to be moved.
CREATE TABLE IF NOT EXISTS languages (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NULL,
  code VARCHAR(10) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  display_order INT NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_language_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO languages (name,native_name,code,is_default,status,display_order) VALUES ('English','English','en',1,'active',1);

CREATE TABLE IF NOT EXISTS ui_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ui_key VARCHAR(190) NOT NULL,
  language_id INT UNSIGNED NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ui_tr (ui_key, language_id),
  CONSTRAINT fk_uitr_lang FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(40) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  field VARCHAR(60) NOT NULL,
  language_id INT UNSIGNED NOT NULL,
  value MEDIUMTEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tr (entity_type, entity_id, field, language_id),
  KEY idx_tr_lang (language_id, entity_type),
  CONSTRAINT fk_tr_lang FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_answer_translations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id BIGINT UNSIGNED NOT NULL,
  project_field_id BIGINT UNSIGNED NOT NULL,
  language_id INT UNSIGNED NOT NULL,
  answer_text MEDIUMTEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_dat (response_id, project_field_id, language_id),
  CONSTRAINT fk_dat_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE,
  CONSTRAINT fk_dat_field FOREIGN KEY (project_field_id) REFERENCES project_fields(id) ON DELETE CASCADE,
  CONSTRAINT fk_dat_lang FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users ADD COLUMN preferred_language_id INT UNSIGNED NULL;
ALTER TABLE projects ADD COLUMN multilingual_enabled TINYINT(1) NOT NULL DEFAULT 0, ADD COLUMN multilingual_languages VARCHAR(255) NULL, ADD COLUMN multilingual_required TINYINT(1) NOT NULL DEFAULT 0;
