-- Phase 19: Customizable public footer and independently selected footer links.

ALTER TABLE themes ADD COLUMN footer_color VARCHAR(20) NULL AFTER button_color;
ALTER TABLE themes ADD COLUMN footer_text_color VARCHAR(20) NULL AFTER footer_color;
ALTER TABLE themes ADD COLUMN footer_use_header_color TINYINT(1) NOT NULL DEFAULT 1 AFTER footer_text_color;
ALTER TABLE themes ADD COLUMN footer_heading_size TINYINT UNSIGNED NOT NULL DEFAULT 14 AFTER footer_use_header_color;
ALTER TABLE themes ADD COLUMN footer_link_size TINYINT UNSIGNED NOT NULL DEFAULT 16 AFTER footer_heading_size;
ALTER TABLE themes ADD COLUMN footer_description VARCHAR(500) NULL AFTER footer_link_size;
ALTER TABLE themes ADD COLUMN footer_standards_text VARCHAR(500) NULL AFTER footer_description;
ALTER TABLE themes ADD COLUMN footer_copyright VARCHAR(255) NULL AFTER footer_standards_text;
ALTER TABLE public_pages ADD COLUMN show_in_footer TINYINT(1) NOT NULL DEFAULT 1 AFTER show_in_menu;