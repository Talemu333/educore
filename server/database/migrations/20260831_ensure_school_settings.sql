-- Ensure every school has its own settings row.
-- Existing school_settings rows are preserved. Missing schools receive defaults.

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- Attach the existing legacy settings row to the first school when it is still unscoped.
UPDATE school_settings ss
SET school_id = s.id
FROM (
    SELECT id FROM schools ORDER BY id LIMIT 1
) s
WHERE ss.school_id IS NULL;

-- Create settings for schools that do not yet have one.
-- school_name is NOT NULL in the existing EduCore schema, so populate it
-- from the owning school rather than relying on a database default.
INSERT INTO school_settings (school_name, school_code, school_id, admission_prefix)
SELECT
    s.school_name,
    s.school_code,
    s.id,
    COALESCE(NULLIF(s.school_code, ''), 'SCH' || s.id::text)
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM school_settings ss WHERE ss.school_id = s.id
);

-- Prevent duplicate settings per school after existing duplicates are resolved.
CREATE UNIQUE INDEX IF NOT EXISTS school_settings_school_id_unique
    ON school_settings (school_id);
