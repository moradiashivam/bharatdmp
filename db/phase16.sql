-- Phase 16: News & Updates (blog) and the Super Admin SEO module.

CREATE TABLE IF NOT EXISTS blog_categories (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(160) NOT NULL,
  slug          VARCHAR(180) NOT NULL,
  description   VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id     BIGINT UNSIGNED NULL,
  organization_id BIGINT UNSIGNED NULL,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL,
  excerpt         VARCHAR(500) NULL,
  content         MEDIUMTEXT NULL,
  cover_image     VARCHAR(255) NULL,
  cover_alt       VARCHAR(255) NULL,
  tags            VARCHAR(500) NULL,
  author_id       BIGINT UNSIGNED NULL,
  author_name     VARCHAR(190) NULL,
  is_featured     TINYINT(1) NOT NULL DEFAULT 0,
  views           INT UNSIGNED NOT NULL DEFAULT 0,
  published_at    DATETIME NULL,
  status          ENUM('draft','published') NOT NULL DEFAULT 'draft',
  seo_title       VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  seo_keywords    VARCHAR(500) NULL,
  og_image        VARCHAR(255) NULL,
  canonical_url   VARCHAR(255) NULL,
  is_indexable    TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_post_slug (slug),
  KEY idx_blog_post_status (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Per-page SEO overrides for routes that are not database pages (home, news list, ...).
CREATE TABLE IF NOT EXISTS seo_routes (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  route_path      VARCHAR(190) NOT NULL,
  label           VARCHAR(190) NULL,
  seo_title       VARCHAR(255) NULL,
  seo_description VARCHAR(500) NULL,
  seo_keywords    VARCHAR(500) NULL,
  og_image        VARCHAR(255) NULL,
  is_indexable    TINYINT(1) NOT NULL DEFAULT 1,
  priority        DECIMAL(2,1) NOT NULL DEFAULT 0.5,
  change_freq     VARCHAR(20) NOT NULL DEFAULT 'weekly',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_seo_route (route_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO blog_categories (name, slug, description, display_order)
VALUES ('News', 'news', 'Platform and policy news', 1),
       ('Updates', 'updates', 'Release notes and system updates', 2),
       ('Guidance', 'guidance', 'How-to guides for researchers and funders', 3);

INSERT IGNORE INTO seo_routes (route_path, label, seo_title, seo_description, priority, change_freq)
VALUES ('/', 'Home page', NULL, NULL, 1.0, 'weekly'),
       ('/news', 'News & Updates', NULL, NULL, 0.8, 'daily'),
       ('/register', 'Researcher registration', NULL, NULL, 0.6, 'monthly');

-- Page builder: separate CSS and JavaScript boxes plus a full-width option.
ALTER TABLE public_pages ADD COLUMN custom_css MEDIUMTEXT NULL AFTER content;
ALTER TABLE public_pages ADD COLUMN custom_js MEDIUMTEXT NULL AFTER custom_css;
ALTER TABLE public_pages ADD COLUMN layout_width VARCHAR(20) NOT NULL DEFAULT 'boxed' AFTER custom_js;
