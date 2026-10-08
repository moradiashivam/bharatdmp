-- Phase 31: repository and registry integrations. Safe to re-run.

ALTER TABLE organizations ADD COLUMN ror_id VARCHAR(64) NULL;

INSERT IGNORE INTO field_types (code,name,input_kind,has_options,display_order) VALUES
  ('ror_affiliation','Organization / Affiliation (ROR lookup)','lookup',0,33),
  ('funder_lookup','Funder (Crossref Funder Registry)','lookup',0,34);

UPDATE field_types SET name='Repository Picker (re3data search)' WHERE code='repository_picker';

-- Institutional storage catalog: approved repositories and storage services
-- an organization recommends. They appear first in repository questions.
CREATE TABLE IF NOT EXISTS storage_catalog (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NOT NULL,
  kind            ENUM('repository','storage','archive') NOT NULL DEFAULT 'repository',
  name            VARCHAR(255) NOT NULL,
  url             VARCHAR(500) NULL,
  re3data_id      VARCHAR(20) NULL,
  description     VARCHAR(1000) NULL,
  policy          VARCHAR(1000) NULL,
  display_order   INT NOT NULL DEFAULT 0,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_sc_org (organization_id, status),
  CONSTRAINT fk_sc_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
