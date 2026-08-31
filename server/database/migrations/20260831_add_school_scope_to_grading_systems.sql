-- Multischool migration: scope grading scales to schools.
-- Safe to run more than once.

ALTER TABLE grading_systems
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- Existing grading scales belong to the original/demo school.
UPDATE grading_systems
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE grading_systems
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_grading_system_school'
          AND conrelid = 'grading_systems'::regclass
    ) THEN
        ALTER TABLE grading_systems
            ADD CONSTRAINT fk_grading_system_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_grading_systems_school_id
    ON grading_systems(school_id);

-- A grade/range may legitimately be reused by another school.
-- Remove old global UNIQUE constraints on this table before adding
-- school-scoped uniqueness.
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT c.conname
        FROM pg_constraint c
        WHERE c.conrelid = 'grading_systems'::regclass
          AND c.contype = 'u'
    LOOP
        EXECUTE format(
            'ALTER TABLE grading_systems DROP CONSTRAINT %I',
            constraint_record.conname
        );
    END LOOP;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_grading_systems_school_grade'
          AND conrelid = 'grading_systems'::regclass
    ) THEN
        ALTER TABLE grading_systems
            ADD CONSTRAINT uq_grading_systems_school_grade
            UNIQUE (school_id, grade);
    END IF;
END $$;
