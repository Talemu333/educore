BEGIN;

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS website_slug VARCHAR(180);

UPDATE school_settings
SET website_slug = CASE
    WHEN NULLIF(regexp_replace(regexp_replace(lower(trim(school_name)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), '') IS NULL
        THEN 'school-' || school_id::text
    ELSE regexp_replace(regexp_replace(lower(trim(school_name)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')
END
WHERE website_slug IS NULL OR trim(website_slug) = '';

WITH duplicates AS (
    SELECT id, website_slug,
           ROW_NUMBER() OVER (PARTITION BY website_slug ORDER BY school_id) AS rn
    FROM school_settings
    WHERE website_slug IS NOT NULL
)
UPDATE school_settings ss
SET website_slug = d.website_slug || '-' || ss.school_id::text
FROM duplicates d
WHERE ss.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS school_settings_website_slug_unique
    ON school_settings (website_slug);

ALTER TABLE school_settings
    ALTER COLUMN website_slug SET NOT NULL;

COMMIT;
