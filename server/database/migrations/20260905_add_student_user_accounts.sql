BEGIN;

-- Link a student record to its own EduCore login account.
-- Existing student records remain intact; the link is optional until an
-- administrator activates a student account.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS student_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_users_student'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT fk_users_student
            FOREIGN KEY (student_id)
            REFERENCES students(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_student_id
    ON users(student_id)
    WHERE student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_student_id
    ON users(student_id);

COMMIT;
