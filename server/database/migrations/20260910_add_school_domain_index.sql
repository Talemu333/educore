BEGIN;

-- Ensure the custom-domain field exists in both legacy and fresh isolated
-- school databases before enforcing uniqueness.
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS domain VARCHAR(255);

-- Ensure a custom domain can belong to only one school.
CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_domain_ci
ON schools (LOWER(TRIM(domain)))
WHERE domain IS NOT NULL AND TRIM(domain) <> '';

COMMIT;
