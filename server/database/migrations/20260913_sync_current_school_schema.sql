-- Reconcile legacy isolated school databases with the current production
-- schema represented by educoreDb(1).sql.
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
ALTER TABLE departments ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

ALTER TABLE fee_types
    ADD COLUMN IF NOT EXISTS school_id INTEGER;
UPDATE fee_types
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;
ALTER TABLE fee_types ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE student_results
    ADD COLUMN IF NOT EXISTS "position" INTEGER;

ALTER TABLE student_promotion_history
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE timetables
    ADD COLUMN IF NOT EXISTS school_id INTEGER;
UPDATE timetables
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;
ALTER TABLE timetables ALTER COLUMN school_id SET NOT NULL;

-- The current production schema stores parent/student relationships in
-- student_parents.relationship_id. The old isolated schema had an obsolete
-- NOT NULL parents.relationship_to_student column.
ALTER TABLE parents
    DROP COLUMN IF EXISTS relationship_to_student;

-- The old isolated schema contains legacy CHECK constraints that are stricter
-- than the current production schema (notably CA/exam score caps). The current
-- production database is the source of truth, so remove stale CHECK constraints
-- before copying its data. Application-level validation remains in place.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT n.nspname AS schema_name,
               c.relname AS table_name,
               con.conname AS constraint_name
        FROM pg_constraint con
        JOIN pg_class c ON c.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND con.contype = 'c'
          AND c.relname NOT IN (
              'eduprow_partner_commissions',
              'eduprow_partner_leads',
              'eduprow_partner_settings',
              'eduprow_partners',
              'school_database_configs',
              'school_database_registry'
          )
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I DROP CONSTRAINT %I',
            r.schema_name, r.table_name, r.constraint_name
        );
    END LOOP;
END $$;

-- The current production schema permits the configured CA/exam maxima to be
-- handled by school settings rather than a hard database CHECK constraint.
-- Preserve the production total-score validity rule.
ALTER TABLE student_results
    ADD CONSTRAINT chk_ca_non_negative CHECK (ca_score >= 0),
    ADD CONSTRAINT chk_exam_non_negative CHECK (exam_score >= 0),
    ADD CONSTRAINT chk_total CHECK (total_score >= 0 AND total_score <= 100),
    ADD CONSTRAINT chk_total_score CHECK (total_score >= 0 AND total_score <= 100);

-- The current production ARM uniqueness rule is per class, not per school.
ALTER TABLE arms DROP CONSTRAINT IF EXISTS uq_school_arm_name;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.arms'::regclass
          AND conname = 'uq_class_arm'
    ) THEN
        ALTER TABLE arms ADD CONSTRAINT uq_class_arm UNIQUE (class_id, arm_name);
    END IF;
END $$;
