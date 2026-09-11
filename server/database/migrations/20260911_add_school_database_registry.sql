BEGIN;

CREATE TABLE IF NOT EXISTS school_database_configs (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    database_name VARCHAR(63) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'shared'
        CHECK (status IN ('shared', 'provisioning', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- The registry must allow multiple schools to use the same shared database
-- during the migration period. Uniqueness will be enforced by school_id,
-- while dedicated databases can later be assigned one per school.
DROP INDEX IF EXISTS school_database_configs_database_name_key;

CREATE INDEX IF NOT EXISTS idx_school_database_configs_database_name
    ON school_database_configs(database_name);

CREATE INDEX IF NOT EXISTS idx_school_database_configs_status
    ON school_database_configs(status);

CREATE OR REPLACE FUNCTION update_school_database_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_school_database_config_timestamp
    ON school_database_configs;

CREATE TRIGGER trg_school_database_config_timestamp
BEFORE UPDATE ON school_database_configs
FOR EACH ROW
EXECUTE FUNCTION update_school_database_config_timestamp();

-- Existing schools remain on the current shared database until explicitly
-- provisioned into their own database.
INSERT INTO school_database_configs (school_id, database_name, status)
SELECT id,
       current_database(),
       'shared'
FROM schools
WHERE is_active = TRUE
ON CONFLICT (school_id) DO NOTHING;

COMMIT;
