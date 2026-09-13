-- Bring existing isolated school databases in line with the current production
-- school schema. The current production reference is educoreDb(1).sql.
-- This migration is intentionally idempotent.

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS logo TEXT;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS admin_type VARCHAR(20);

ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE departments
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE departments
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

ALTER TABLE fee_types
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE fee_types
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE fee_types
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE student_results
    ADD COLUMN IF NOT EXISTS "position" INTEGER;

ALTER TABLE student_promotion_history
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE timetables
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE timetables
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

ALTER TABLE timetables
    ALTER COLUMN school_id SET NOT NULL;
