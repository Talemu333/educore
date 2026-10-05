BEGIN;

-- Repair isolated-school databases so the current dashboard and finance
-- modules have the tenant fields/tables they expect.
--
-- This migration is intentionally safe for an isolated school database:
-- the database contains the school's own records, so existing students can
-- be assigned to the single school represented by public.schools.

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE students
SET school_id = (
    SELECT id
    FROM schools
    ORDER BY id
    LIMIT 1
)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name = 'students'
                 AND column_name = 'school_id') THEN

        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'fk_students_school'
              AND conrelid = 'public.students'::regclass
        ) THEN
            ALTER TABLE students
                ADD CONSTRAINT fk_students_school
                FOREIGN KEY (school_id)
                REFERENCES schools(id)
                ON DELETE RESTRICT;
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = 'students'
              AND indexname = 'idx_students_school_id'
        ) THEN
            CREATE INDEX idx_students_school_id ON students(school_id);
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM students
            WHERE school_id IS NULL
        ) THEN
            ALTER TABLE students
                ALTER COLUMN school_id SET NOT NULL;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL,
    vendor VARCHAR(255),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expenses_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_expenses_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_expenses_school_date
    ON expenses(school_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_school_category
    ON expenses(school_id, category);

CREATE INDEX IF NOT EXISTS idx_expenses_school_payment_method
    ON expenses(school_id, payment_method);

COMMIT;
