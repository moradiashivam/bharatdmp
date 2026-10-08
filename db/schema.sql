-- =====================================================================
-- DATA MANAGEMENT PLAN SYSTEM - MySQL Schema
-- Executed automatically by setup.bat (npm run db:setup)
-- Engine: InnoDB, Charset: utf8mb4
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- ORGANIZATIONS (multi-tenant root: funder / institution / future types)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  org_type        ENUM('funder','institution','other') NOT NULL,
  name            VARCHAR(255) NOT NULL,
  short_name      VARCHAR(100) NULL,
  slug            VARCHAR(160) NOT NULL,
  registration_no VARCHAR(100) NULL,
  institution_type VARCHAR(100) NULL,
  email           VARCHAR(190) NULL,
  phone           VARCHAR(50) NULL,
  website         VARCHAR(255) NULL,
  address         TEXT NULL,
  city            VARCHAR(120) NULL,
  state           VARCHAR(120) NULL,
  country         VARCHAR(120) NULL,
  contact_person  VARCHAR(190) NULL,
  contact_email   VARCHAR(190) NULL,
  contact_phone   VARCHAR(50) NULL,
  logo            VARCHAR(255) NULL,
  favicon         VARCHAR(255) NULL,
  banner_image    VARCHAR(255) NULL,
  description     TEXT NULL,
  terms_conditions MEDIUMTEXT NULL,
  privacy_policy  MEDIUMTEXT NULL,
  primary_color   VARCHAR(20) DEFAULT '#1B3A6B',
  secondary_color VARCHAR(20) DEFAULT '#2E7D6F',
  header_color    VARCHAR(20) NULL,
  button_color    VARCHAR(20) NULL,
  font_family     VARCHAR(120) NULL,
  social_links    JSON NULL,
  seo_title       VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  seo_keywords    VARCHAR(500) NULL,
  og_image        VARCHAR(255) NULL,
  is_indexable    TINYINT(1) NOT NULL DEFAULT 1,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_org_slug (slug),
  KEY idx_org_type_status (org_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- ROLES / PERMISSIONS / USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(60) NOT NULL,
  name        VARCHAR(120) NOT NULL,
  scope       ENUM('system','funder','institution','researcher') NOT NULL,
  description VARCHAR(255) NULL,
  is_system   TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code       VARCHAR(120) NOT NULL,
  name       VARCHAR(160) NOT NULL,
  module     VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_perm_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id   BIGINT UNSIGNED NULL,
  role_id           INT UNSIGNED NOT NULL,
  name              VARCHAR(190) NOT NULL,
  email             VARCHAR(190) NOT NULL,
  mobile            VARCHAR(50) NULL,
  password_hash     VARCHAR(255) NOT NULL,
  status            ENUM('active','inactive','pending') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  verification_token VARCHAR(120) NULL,
  reset_token       VARCHAR(120) NULL,
  reset_expires_at  DATETIME NULL,
  failed_attempts   INT NOT NULL DEFAULT 0,
  locked_until      DATETIME NULL,
  last_login_at     DATETIME NULL,
  last_login_ip     VARCHAR(64) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_email (email),
  KEY idx_user_org (organization_id),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS researcher_profiles (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  institution   VARCHAR(255) NULL,
  department    VARCHAR(190) NULL,
  designation   VARCHAR(190) NULL,
  orcid         VARCHAR(60) NULL,
  research_area VARCHAR(255) NULL,
  country       VARCHAR(120) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_profile_user (user_id),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- DOMAINS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS domains (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(190) NOT NULL,
  short_code    VARCHAR(40) NOT NULL,
  slug          VARCHAR(190) NOT NULL,
  description   TEXT NULL,
  icon          VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_domain_slug (slug),
  UNIQUE KEY uq_domain_code (short_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- FIELD TYPES / MASTER FIELDS (+ versioning)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_types (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code          VARCHAR(60) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  input_kind    VARCHAR(60) NOT NULL,
  has_options   TINYINT(1) NOT NULL DEFAULT 0,
  description   VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  UNIQUE KEY uq_ft_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS master_field_groups (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(190) NOT NULL,
  description   VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS master_fields (
  id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  group_id       INT UNSIGNED NULL,
  field_type_id  INT UNSIGNED NOT NULL,
  field_name     VARCHAR(120) NOT NULL,
  field_label    VARCHAR(255) NOT NULL,
  description    TEXT NULL,
  help_text      VARCHAR(500) NULL,
  placeholder    VARCHAR(255) NULL,
  is_required    TINYINT(1) NOT NULL DEFAULT 0,
  default_value  TEXT NULL,
  validation     VARCHAR(255) NULL,
  min_length     INT NULL,
  max_length     INT NULL,
  min_value      DECIMAL(18,4) NULL,
  max_value      DECIMAL(18,4) NULL,
  display_order  INT NOT NULL DEFAULT 0,
  version        INT NOT NULL DEFAULT 1,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mf_name (field_name),
  CONSTRAINT fk_mf_type FOREIGN KEY (field_type_id) REFERENCES field_types(id),
  CONSTRAINT fk_mf_group FOREIGN KEY (group_id) REFERENCES master_field_groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS master_field_versions (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  master_field_id BIGINT UNSIGNED NOT NULL,
  version         INT NOT NULL,
  snapshot        JSON NOT NULL,
  changed_by      BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mfv (master_field_id, version),
  CONSTRAINT fk_mfv_field FOREIGN KEY (master_field_id) REFERENCES master_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS field_options (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  master_field_id BIGINT UNSIGNED NULL,
  project_field_id BIGINT UNSIGNED NULL,
  option_label    VARCHAR(255) NOT NULL,
  option_value    VARCHAR(255) NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  KEY idx_fo_master (master_field_id),
  KEY idx_fo_project (project_field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PROJECTS / SECTIONS / PROJECT FIELDS (snapshot of master fields)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id  BIGINT UNSIGNED NOT NULL,
  domain_id        BIGINT UNSIGNED NULL,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(220) NOT NULL,
  description      TEXT NULL,
  instructions     MEDIUMTEXT NULL,
  eligibility      TEXT NULL,
  requirements     TEXT NULL,
  contact_info     VARCHAR(500) NULL,
  start_date       DATE NULL,
  end_date         DATE NULL,
  submission_deadline DATE NULL,
  banner_image     VARCHAR(255) NULL,
  seo_title        VARCHAR(255) NULL,
  seo_description  VARCHAR(500) NULL,
  seo_keywords     VARCHAR(500) NULL,
  og_image         VARCHAR(255) NULL,
  is_indexable     TINYINT(1) NOT NULL DEFAULT 1,
  status           ENUM('draft','active','paused','closed','archived') NOT NULL DEFAULT 'draft',
  project_nav_title VARCHAR(120) NULL,
  project_footer_description VARCHAR(500) NULL,
  project_footer_email VARCHAR(255) NULL,
  project_footer_phone VARCHAR(80) NULL,
  project_footer_copyright VARCHAR(255) NULL,
  project_footer_color VARCHAR(20) NULL,
  project_footer_text_color VARCHAR(20) NULL,
  project_footer_heading_size TINYINT UNSIGNED NOT NULL DEFAULT 14,
  project_footer_link_size TINYINT UNSIGNED NOT NULL DEFAULT 16,
  created_by       BIGINT UNSIGNED NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_slug (organization_id, slug),
  KEY idx_project_status (status),
  CONSTRAINT fk_project_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS project_pages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  organization_id BIGINT UNSIGNED NOT NULL,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT NULL,
  custom_css MEDIUMTEXT NULL,
  custom_js MEDIUMTEXT NULL,
  display_order INT NOT NULL DEFAULT 0,
  show_in_project_nav TINYINT(1) NOT NULL DEFAULT 1,
  show_in_project_footer TINYINT(1) NOT NULL DEFAULT 1,
  is_overview TINYINT(1) NOT NULL DEFAULT 0,
  seo_title VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  seo_keywords VARCHAR(500) NULL,
  is_indexable TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('published','draft') NOT NULL DEFAULT 'published',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_page_slug (project_id, slug),
  KEY idx_pp_org (organization_id),
  KEY idx_pp_public (project_id, status, display_order),
  CONSTRAINT fk_pp_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pp_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS form_sections (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id    BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NULL,
  instructions  TEXT NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fs_project (project_id),
  CONSTRAINT fk_fs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- project_fields = frozen snapshot of a master field OR a custom field
CREATE TABLE IF NOT EXISTS project_fields (
  id                   BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id           BIGINT UNSIGNED NOT NULL,
  section_id           BIGINT UNSIGNED NULL,
  master_field_id      BIGINT UNSIGNED NULL,
  master_field_version INT NULL,
  source               ENUM('master','custom') NOT NULL DEFAULT 'master',
  field_type_id        INT UNSIGNED NOT NULL,
  field_name           VARCHAR(120) NOT NULL,
  field_label          VARCHAR(255) NOT NULL,
  description          TEXT NULL,
  help_text            VARCHAR(500) NULL,
  placeholder          VARCHAR(255) NULL,
  is_required          TINYINT(1) NOT NULL DEFAULT 0,
  default_value        TEXT NULL,
  validation           VARCHAR(255) NULL,
  min_length           INT NULL,
  max_length           INT NULL,
  min_value            DECIMAL(18,4) NULL,
  max_value            DECIMAL(18,4) NULL,
  config               JSON NULL,
  display_order        INT NOT NULL DEFAULT 0,
  status               ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_pf_project (project_id, display_order),
  CONSTRAINT fk_pf_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pf_section FOREIGN KEY (section_id) REFERENCES form_sections(id) ON DELETE SET NULL,
  CONSTRAINT fk_pf_type FOREIGN KEY (field_type_id) REFERENCES field_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conditional_rules (
  id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id        BIGINT UNSIGNED NOT NULL,
  target_field_id   BIGINT UNSIGNED NOT NULL,
  source_field_id   BIGINT UNSIGNED NOT NULL,
  operator          ENUM('equals','not_equals','contains','greater_than','less_than','is_empty','is_not_empty') NOT NULL DEFAULT 'equals',
  compare_value     VARCHAR(255) NULL,
  action            ENUM('show','hide','require') NOT NULL DEFAULT 'show',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cr_project (project_id),
  CONSTRAINT fk_cr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_cr_target FOREIGN KEY (target_field_id) REFERENCES project_fields(id) ON DELETE CASCADE,
  CONSTRAINT fk_cr_source FOREIGN KEY (source_field_id) REFERENCES project_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- RESPONSES / SUBMISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dmp_responses (
  id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id     BIGINT UNSIGNED NOT NULL,
  user_id        BIGINT UNSIGNED NOT NULL,
  status         ENUM('draft','submitted','under_review','returned','resubmitted','approved','rejected') NOT NULL DEFAULT 'draft',
  current_section INT NOT NULL DEFAULT 1,
  last_saved_at  DATETIME NULL,
  submitted_at   DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_resp_project_user (project_id, user_id),
  CONSTRAINT fk_resp_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_resp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_response_values (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id      BIGINT UNSIGNED NOT NULL,
  project_field_id BIGINT UNSIGNED NOT NULL,
  value_text       MEDIUMTEXT NULL,
  value_number     DECIMAL(18,4) NULL,
  value_date       DATETIME NULL,
  value_json       JSON NULL,
  file_id          BIGINT UNSIGNED NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rv (response_id, project_field_id),
  CONSTRAINT fk_rv_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE,
  CONSTRAINT fk_rv_field FOREIGN KEY (project_field_id) REFERENCES project_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dmp_submissions (
  id             BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  response_id    BIGINT UNSIGNED NOT NULL,
  submission_no  VARCHAR(60) NOT NULL,
  version        INT NOT NULL DEFAULT 1,
  status         ENUM('submitted','under_review','returned','resubmitted','approved','rejected') NOT NULL DEFAULT 'submitted',
  submitted_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by    BIGINT UNSIGNED NULL,
  reviewed_at    DATETIME NULL,
  review_remarks TEXT NULL,
  UNIQUE KEY uq_sub_no (submission_no),
  KEY idx_sub_resp (response_id),
  CONSTRAINT fk_sub_resp FOREIGN KEY (response_id) REFERENCES dmp_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_versions (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT UNSIGNED NOT NULL,
  version       INT NOT NULL,
  snapshot      JSON NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sv (submission_id, version),
  CONSTRAINT fk_sv_sub FOREIGN KEY (submission_id) REFERENCES dmp_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submission_comments (
  id               BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  submission_id    BIGINT UNSIGNED NOT NULL,
  project_field_id BIGINT UNSIGNED NULL,
  user_id          BIGINT UNSIGNED NOT NULL,
  parent_id        BIGINT UNSIGNED NULL,
  comment          TEXT NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sc_sub (submission_id),
  CONSTRAINT fk_sc_sub FOREIGN KEY (submission_id) REFERENCES dmp_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PLATFORM: pdf templates, themes, pages, settings, audit, notifications, files
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pdf_templates (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NULL,
  name            VARCHAR(190) NOT NULL,
  page_size       VARCHAR(20) NOT NULL DEFAULT 'A4',
  margin_top      INT NOT NULL DEFAULT 50,
  margin_right    INT NOT NULL DEFAULT 50,
  margin_bottom   INT NOT NULL DEFAULT 50,
  margin_left     INT NOT NULL DEFAULT 50,
  header_text     VARCHAR(500) NULL,
  footer_text     VARCHAR(500) NULL,
  logo_position   ENUM('left','center','right') NOT NULL DEFAULT 'left',
  font_family     VARCHAR(80) NOT NULL DEFAULT 'Helvetica',
  font_size       INT NOT NULL DEFAULT 11,
  show_page_numbers TINYINT(1) NOT NULL DEFAULT 1,
  show_signature  TINYINT(1) NOT NULL DEFAULT 1,
  is_default      TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS themes (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(120) NOT NULL,
  primary_color   VARCHAR(20) NOT NULL,
  secondary_color VARCHAR(20) NOT NULL,
  header_color    VARCHAR(20) NULL,
  button_color    VARCHAR(20) NULL,
  footer_color    VARCHAR(20) NULL,
  footer_text_color VARCHAR(20) NULL,
  footer_use_header_color TINYINT(1) NOT NULL DEFAULT 1,
  footer_heading_size TINYINT UNSIGNED NOT NULL DEFAULT 14,
  footer_link_size TINYINT UNSIGNED NOT NULL DEFAULT 16,
  footer_description VARCHAR(500) NULL,
  footer_standards_text VARCHAR(500) NULL,
  footer_copyright VARCHAR(255) NULL,
  font_family     VARCHAR(120) NULL,
  is_default      TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS public_pages (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slug            VARCHAR(160) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  content         MEDIUMTEXT NULL,
  seo_title       VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  seo_keywords    VARCHAR(500) NULL,
  display_order   INT NOT NULL DEFAULT 0,
  show_in_menu    TINYINT(1) NOT NULL DEFAULT 1,
  show_in_footer  TINYINT(1) NOT NULL DEFAULT 1,
  status          ENUM('published','draft') NOT NULL DEFAULT 'published',
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_page_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS system_settings (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  setting_group VARCHAR(60) NOT NULL,
  setting_key  VARCHAR(120) NOT NULL,
  setting_value TEXT NULL,
  value_type   VARCHAR(30) NOT NULL DEFAULT 'string',
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_setting (setting_group, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS modules (
  id        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code      VARCHAR(60) NOT NULL,
  name      VARCHAR(120) NOT NULL,
  enabled   TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_module_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NULL,
  organization_id BIGINT UNSIGNED NULL,
  action          VARCHAR(80) NOT NULL,
  entity_type     VARCHAR(80) NULL,
  entity_id       BIGINT UNSIGNED NULL,
  description     VARCHAR(500) NULL,
  meta            JSON NULL,
  ip_address      VARCHAR(64) NULL,
  user_agent      VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_user (user_id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NULL,
  link       VARCHAR(255) NULL,
  channel    ENUM('web','email','sms') NOT NULL DEFAULT 'web',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif_user (user_id, is_read),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS files (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NULL,
  organization_id BIGINT UNSIGNED NULL,
  original_name   VARCHAR(255) NOT NULL,
  stored_name     VARCHAR(255) NOT NULL,
  storage_driver  VARCHAR(40) NOT NULL DEFAULT 'local',
  path            VARCHAR(500) NOT NULL,
  mime_type       VARCHAR(160) NULL,
  size_bytes      BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_file_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
