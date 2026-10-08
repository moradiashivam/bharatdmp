-- Phase 26: researcher productivity (clone plan, profile prefill, guidance
-- panel, completeness checker). Safe to re-run.

ALTER TABLE project_fields
  ADD COLUMN guidance_text TEXT NULL,
  ADD COLUMN guidance_example TEXT NULL,
  ADD COLUMN guidance_links TEXT NULL,
  ADD COLUMN prefill_source VARCHAR(40) NULL;

ALTER TABLE researcher_profiles ADD COLUMN grant_number VARCHAR(120) NULL;

-- Which plan a draft was copied from (for audit / "copied from" label).
ALTER TABLE dmp_responses ADD COLUMN cloned_from_id BIGINT UNSIGNED NULL;
