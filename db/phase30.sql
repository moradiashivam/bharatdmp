-- Phase 30: analytics and FAIR insights. Safe to re-run.

-- FAIR self-assessment rules. organization_id NULL = platform default rules
-- (Super Admin). An organization that defines its own rules uses only those.
CREATE TABLE IF NOT EXISTS fair_rules (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,
  principle       ENUM('F','A','I','R') NOT NULL,
  label           VARCHAR(255) NOT NULL,
  field_name      VARCHAR(120) NOT NULL,
  condition_type  ENUM('answered','equals','contains','one_of','open_licence','min_words') NOT NULL DEFAULT 'answered',
  condition_value VARCHAR(500) NULL,
  points          INT UNSIGNED NOT NULL DEFAULT 1,
  display_order   INT NOT NULL DEFAULT 0,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fair_org (organization_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Starter platform rules (only inserted when no platform rules exist yet).
INSERT INTO fair_rules (organization_id, principle, label, field_name, condition_type, condition_value, points, display_order)
SELECT * FROM (
  SELECT NULL AS o, 'F' AS p, 'Data will be described with keywords' AS l, 'keywords' AS f, 'answered' AS c, NULL AS v, 2 AS pts, 1 AS d UNION ALL
  SELECT NULL, 'F', 'Data has a clear description', 'data_description', 'min_words', '30', 2, 2 UNION ALL
  SELECT NULL, 'A', 'A repository is named', 'repository', 'answered', NULL, 3, 3 UNION ALL
  SELECT NULL, 'A', 'Preservation is explained', 'preservation', 'answered', NULL, 2, 4 UNION ALL
  SELECT NULL, 'I', 'Data types / formats are stated', 'data_type', 'answered', NULL, 2, 5 UNION ALL
  SELECT NULL, 'R', 'An open licence is chosen', 'licence', 'open_licence', NULL, 3, 6 UNION ALL
  SELECT NULL, 'R', 'Quality assurance is described', 'data_quality', 'answered', NULL, 2, 7
) seed
WHERE NOT EXISTS (SELECT 1 FROM fair_rules WHERE organization_id IS NULL);

-- Storage cost estimator settings per organization (NULL = platform default).
CREATE TABLE IF NOT EXISTS analytics_settings (
  id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id     BIGINT UNSIGNED NULL,
  org_key             BIGINT UNSIGNED NOT NULL DEFAULT 0,
  cost_per_tb_year    DECIMAL(12,2) NOT NULL DEFAULT 100.00,
  currency            VARCHAR(8) NOT NULL DEFAULT 'USD',
  retention_years     INT UNSIGNED NOT NULL DEFAULT 10,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_analytics_org (org_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO analytics_settings (organization_id, org_key) VALUES (NULL, 0);
