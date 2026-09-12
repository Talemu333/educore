-- Central database registry for the separate-database school architecture.
-- This migration belongs in the platform/central database, not in an individual school database.

CREATE TABLE IF NOT EXISTS school_database_registry (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    database_name VARCHAR(63) NOT NULL UNIQUE,
    website_slug VARCHAR(180) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_school_database_registry_slug
    ON school_database_registry (LOWER(website_slug));

-- Register existing schools without changing their existing school data.
INSERT INTO school_database_registry (school_id, database_name, website_slug)
SELECT
    s.id,
    'educore_school_' || s.id::text,
    COALESCE(
        NULLIF(
            regexp_replace(
                regexp_replace(lower(trim(s.school_name)), '[^a-z0-9]+', '-', 'g'),
                '(^-|-$)', '', 'g'
            ),
            ''
        ),
        'school-' || s.id::text
    )
FROM schools s
WHERE NOT EXISTS (
    SELECT 1
    FROM school_database_registry r
    WHERE r.school_id = s.id
);
