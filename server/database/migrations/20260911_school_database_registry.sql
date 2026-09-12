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
-- Existing school_settings.website_slug values are preserved where possible.
-- Duplicate/missing slugs are made deterministic by appending the school ID.
WITH candidates AS (
    SELECT
        s.id AS school_id,
        'educore_school_' || s.id::text AS database_name,
        COALESCE(
            NULLIF(TRIM(ss.website_slug), ''),
            NULLIF(
                regexp_replace(
                    regexp_replace(lower(trim(s.school_name)), '[^a-z0-9]+', '-', 'g'),
                    '(^-|-$)', '', 'g'
                ),
                ''
            ),
            'school-' || s.id::text
        ) AS base_slug
    FROM schools s
    LEFT JOIN school_settings ss ON ss.school_id = s.id
),
ranked AS (
    SELECT
        school_id,
        database_name,
        base_slug,
        ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY school_id) AS slug_rank
    FROM candidates
),
resolved AS (
    SELECT
        school_id,
        database_name,
        CASE
            WHEN slug_rank = 1 THEN LEFT(base_slug, 180)
            ELSE LEFT(base_slug, 169) || '-' || school_id::text
        END AS website_slug
    FROM ranked
)
INSERT INTO school_database_registry (school_id, database_name, website_slug, is_active)
SELECT school_id, database_name, website_slug, FALSE
FROM resolved
WHERE NOT EXISTS (
    SELECT 1
    FROM school_database_registry r
    WHERE r.school_id = resolved.school_id
);
