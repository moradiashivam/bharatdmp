-- Phase 18: Group management, domain <-> master field linking, ready-made templates.

ALTER TABLE master_field_groups ADD COLUMN group_code VARCHAR(40) NULL AFTER name;

UPDATE master_field_groups SET group_code = CONCAT('GRP-', LPAD(id, 3, '0')) WHERE group_code IS NULL OR group_code = '';

CREATE TABLE IF NOT EXISTS master_field_domains (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  master_field_id BIGINT UNSIGNED NOT NULL,
  domain_id       BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mfd (master_field_id, domain_id),
  CONSTRAINT fk_mfd_field FOREIGN KEY (master_field_id) REFERENCES master_fields(id) ON DELETE CASCADE,
  CONSTRAINT fk_mfd_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS field_templates (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(191) NOT NULL,
  description   TEXT NULL,
  domain_id     BIGINT UNSIGNED NULL,
  group_id      INT UNSIGNED NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ft_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL,
  CONSTRAINT fk_ft_group FOREIGN KEY (group_id) REFERENCES master_field_groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS field_template_items (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id     BIGINT UNSIGNED NOT NULL,
  master_field_id BIGINT UNSIGNED NOT NULL,
  section_title   VARCHAR(191) NULL,
  display_order   INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_fti (template_id, master_field_id),
  CONSTRAINT fk_fti_template FOREIGN KEY (template_id) REFERENCES field_templates(id) ON DELETE CASCADE,
  CONSTRAINT fk_fti_field FOREIGN KEY (master_field_id) REFERENCES master_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
