-- Ensure a custom domain can belong to only one school.
CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_domain_ci
ON schools (LOWER(TRIM(domain)))
WHERE domain IS NOT NULL AND TRIM(domain) <> '';
