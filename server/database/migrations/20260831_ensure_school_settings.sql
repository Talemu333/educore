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
-- school_settings has no school_code column. The school's code is used
-- as the admission prefix, while the school identity is stored in school_id.
INSERT INTO school_settings (
    school_name,
    admission_prefix,
    school_email,
    school_phone,
    school_address,
    school_id
)
SELECT
    s.school_name,
    COALESCE(NULLIF(s.school_code, ''), 'SCH' || s.id::text),
    s.email,
    s.phone,
    s.address,
    s.id
FROM schools s
WHERE NOT EXISTS (
    SELECT 1
    FROM school_settings ss
    WHERE ss.school_id = s.id
);

-- Prevent duplicate settings per school after existing duplicates are resolved.
CREATE UNIQUE INDEX IF NOT EXISTS school_settings_school_id_unique
    ON school_settings (school_id);
