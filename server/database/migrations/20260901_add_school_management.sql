BEGIN;

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE school_settings
SET is_active = TRUE
WHERE is_active IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_school_settings_school_id
    ON school_settings (school_id);

COMMIT;
