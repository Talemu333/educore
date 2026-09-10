BEGIN;

-- Ensure the minimum tenant metadata required by the public school website
-- exists in production. This migration is intentionally limited to
-- school_settings so it can be safely applied independently of the larger
-- academic-data migrations.

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS website_slug VARCHAR(180);

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Attach legacy settings rows to the original/demo school when possible.
UPDATE school_settings ss
SET school_id = s.id
FROM (
    SELECT id
    FROM schools
    ORDER BY id
    LIMIT 1
) s
WHERE ss.school_id IS NULL;

-- Create a settings row for schools that do not have one yet.
INSERT INTO school_settings (
    school_name,
    admission_prefix,
    school_email,
    school_phone,
    school_address,
    school_id,
    website_slug,
    is_active
)
SELECT
    s.school_name,
    COALESCE(NULLIF(s.school_code, ''), 'SCH' || s.id::text),
    s.email,
    s.phone,
    s.address,
    s.id,
    NULL,
    TRUE
FROM schools s
WHERE NOT EXISTS (
    SELECT 1
    FROM school_settings ss
    WHERE ss.school_id = s.id
);

-- Generate a stable public slug from the canonical school name.
UPDATE school_settings ss
SET website_slug = CASE
    WHEN NULLIF(
        regexp_replace(
            regexp_replace(lower(trim(s.school_name)), '[^a-z0-9]+', '-', 'g'),
            '(^-|-$)',
            '',
            'g'
        ),
        ''
    ) IS NULL
    THEN 'school-' || s.id::text
    ELSE regexp_replace(
        regexp_replace(lower(trim(s.school_name)), '[^a-z0-9]+', '-', 'g'),
        '(^-|-$)',
        '',
        'g'
    )
END
FROM schools s
WHERE s.id = ss.school_id
  AND (ss.website_slug IS NULL OR trim(ss.website_slug) = '');

UPDATE school_settings
SET is_active = TRUE
WHERE is_active IS NULL;

COMMIT;
