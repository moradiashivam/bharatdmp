-- Phase 27: template engine upgrades (versions, clone, JSON import/export,
-- validation rules, new field types). Safe to re-run.

CREATE TABLE IF NOT EXISTS project_template_versions (
  id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id   BIGINT UNSIGNED NOT NULL,
  version      INT NOT NULL,
  snapshot     LONGTEXT NOT NULL,
  notes        VARCHAR(500) NULL,
  published_by BIGINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ptv (project_id, version),
  CONSTRAINT fk_ptv_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE projects ADD COLUMN current_template_version INT NULL;
ALTER TABLE dmp_responses ADD COLUMN template_version INT NULL;

ALTER TABLE project_fields
  ADD COLUMN word_min INT NULL,
  ADD COLUMN word_max INT NULL,
  ADD COLUMN regex VARCHAR(255) NULL,
  ADD COLUMN regex_message VARCHAR(255) NULL,
  ADD COLUMN date_min DATE NULL,
  ADD COLUMN date_max DATE NULL;

INSERT IGNORE INTO field_types (code,name,input_kind,has_options,display_order) VALUES
  ('licence_picker','Licence Picker','select',0,30),
  ('repository_picker','Repository Picker','select',0,31),
  ('storage_size','Storage Size (GB/TB)','storage',0,32);
