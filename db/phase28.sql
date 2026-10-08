-- Phase 28: standards and exports (maDMP mapping, plan publishing,
-- per-funder sharing policy, PDF/DOCX cover page). Safe to re-run.

CREATE TABLE IF NOT EXISTS madmp_mappings (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  field_name  VARCHAR(120) NOT NULL,
  madmp_path  VARCHAR(120) NOT NULL,
  updated_by  BIGINT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_madmp_field (field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO madmp_mappings (field_name, madmp_path) VALUES
  ('project_title', 'dmp.project.title'),
  ('project_summary', 'dmp.project.description'),
  ('project_description', 'dmp.project.description'),
  ('grant_number', 'dmp.project.funding.grant_id'),
  ('project_start_date', 'dmp.project.start'),
  ('project_end_date', 'dmp.project.end'),
  ('ethical_issues', 'dmp.ethical_issues_exist'),
  ('ethics_description', 'dmp.ethical_issues_description'),
  ('personal_data', 'dmp.dataset.personal_data'),
  ('sensitive_data', 'dmp.dataset.sensitive_data'),
  ('data_description', 'dmp.dataset.description'),
  ('data_type', 'dmp.dataset.type'),
  ('data_quality', 'dmp.dataset.data_quality_assurance'),
  ('preservation', 'dmp.dataset.preservation_statement'),
  ('keywords', 'dmp.dataset.keyword'),
  ('licence', 'dmp.dataset.distribution.license'),
  ('license', 'dmp.dataset.distribution.license'),
  ('repository', 'dmp.dataset.distribution.host'),
  ('storage_size', 'dmp.dataset.distribution.byte_size'),
  ('data_access', 'dmp.dataset.distribution.data_access');

ALTER TABLE dmp_responses
  ADD COLUMN visibility ENUM('private','funder','public') NOT NULL DEFAULT 'private',
  ADD COLUMN public_token VARCHAR(48) NULL,
  ADD COLUMN published_at DATETIME NULL;

ALTER TABLE projects
  ADD COLUMN visibility_policy ENUM('researcher_choice','private','funder','public') NOT NULL DEFAULT 'researcher_choice';

ALTER TABLE pdf_templates
  ADD COLUMN cover_page TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN cover_title VARCHAR(255) NULL,
  ADD COLUMN cover_subtitle VARCHAR(500) NULL,
  ADD COLUMN tagged_pdf TINYINT(1) NOT NULL DEFAULT 1;
