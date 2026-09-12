-- Central registry for the separate-database school architecture.
-- This migration belongs in the platform/central database.

CREATE TABLE IF NOT EXISTS school_database_registry (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    database_name VARCHAR(63) NOT NULL UNIQUE,
    website_slug VARCHAR(180) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_school_database_registry_slug
    ON school_database_registry (LOWER(website_slug));

-- Register existing schools, but keep them on the shared database until
-- their dedicated database has actually been provisioned and verified.
INSERT INTO school_database_registry (school_id, database_name, website_slug)
SELECT
    s.id,
    'educore_school_' || s.id::text,
    ss.website_slug
FROM schools s
INNER JOIN school_settings ss ON ss.school_id = s.id
WHERE NOT EXISTS (
    SELECT 1
    FROM school_database_registry r
    WHERE r.school_id = s.id
);
