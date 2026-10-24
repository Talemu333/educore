-- Optional teacher identification and certificate links.
-- Apply this migration to each school's database; document files are not stored in PostgreSQL.
ALTER TABLE IF EXISTS teachers
    ADD COLUMN IF NOT EXISTS nin VARCHAR(11),
    ADD COLUMN IF NOT EXISTS degree_certificate_url TEXT,
    ADD COLUMN IF NOT EXISTS other_certificates_url TEXT,
    ADD COLUMN IF NOT EXISTS birth_certificate_url TEXT;

UPDATE teachers SET nin = NULL WHERE BTRIM(COALESCE(nin, '')) = '';
UPDATE teachers SET degree_certificate_url = NULL WHERE BTRIM(COALESCE(degree_certificate_url, '')) = '';
UPDATE teachers SET other_certificates_url = NULL WHERE BTRIM(COALESCE(other_certificates_url, '')) = '';
UPDATE teachers SET birth_certificate_url = NULL WHERE BTRIM(COALESCE(birth_certificate_url, '')) = '';
