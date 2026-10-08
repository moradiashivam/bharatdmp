-- Phase 20: funder-managed mini websites for every DMP project.
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

ALTER TABLE projects ADD COLUMN project_nav_title VARCHAR(120) NULL AFTER start_button_label;
ALTER TABLE projects ADD COLUMN project_footer_description VARCHAR(500) NULL AFTER project_nav_title;
ALTER TABLE projects ADD COLUMN project_footer_email VARCHAR(255) NULL AFTER project_footer_description;
ALTER TABLE projects ADD COLUMN project_footer_phone VARCHAR(80) NULL AFTER project_footer_email;
ALTER TABLE projects ADD COLUMN project_footer_copyright VARCHAR(255) NULL AFTER project_footer_phone;
ALTER TABLE projects ADD COLUMN project_footer_color VARCHAR(20) NULL AFTER project_footer_copyright;
ALTER TABLE projects ADD COLUMN project_footer_text_color VARCHAR(20) NULL AFTER project_footer_color;
ALTER TABLE projects ADD COLUMN project_footer_heading_size TINYINT UNSIGNED NOT NULL DEFAULT 14 AFTER project_footer_text_color;
ALTER TABLE projects ADD COLUMN project_footer_link_size TINYINT UNSIGNED NOT NULL DEFAULT 16 AFTER project_footer_heading_size;

INSERT IGNORE INTO project_pages (project_id,organization_id,slug,title,content,display_order,show_in_project_nav,show_in_project_footer,is_overview,status,created_by)
SELECT id,organization_id,'overview','Overview',NULL,1,1,1,1,'published',created_by FROM projects;
INSERT IGNORE INTO project_pages (project_id,organization_id,slug,title,content,display_order,show_in_project_nav,show_in_project_footer,status,created_by)
SELECT id,organization_id,'eligibility','Eligibility','<section><h2>Eligibility</h2><p>Please review the eligibility information for this DMP call.</p></section>',2,1,1,'published',created_by FROM projects;
INSERT IGNORE INTO project_pages (project_id,organization_id,slug,title,content,display_order,show_in_project_nav,show_in_project_footer,status,created_by)
SELECT id,organization_id,'guidelines','Guidelines','<section><h2>Guidelines</h2><p>Use this page to publish project-specific instructions and requirements.</p></section>',3,1,1,'published',created_by FROM projects;
INSERT IGNORE INTO project_pages (project_id,organization_id,slug,title,content,display_order,show_in_project_nav,show_in_project_footer,status,created_by)
SELECT id,organization_id,'faq','FAQ','<section><h2>Frequently asked questions</h2><p>Add answers to common questions about this DMP call.</p></section>',4,1,1,'published',created_by FROM projects;
INSERT IGNORE INTO project_pages (project_id,organization_id,slug,title,content,display_order,show_in_project_nav,show_in_project_footer,status,created_by)
SELECT id,organization_id,'contact','Contact','<section><h2>Contact</h2><p>Publish the contact details researchers should use for assistance.</p></section>',5,1,1,'published',created_by FROM projects;
