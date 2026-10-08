-- Reconcile the established student-account relationship for every
-- dedicated school database. The canonical relationship is users.student_id.
-- Some older dedicated databases predate the migration that introduced it.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS student_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_users_student'
          AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT fk_users_student
            FOREIGN KEY (student_id) REFERENCES students(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_student_id
    ON users(student_id)
    WHERE student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_student_id
    ON users(student_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'user_id'
    ) THEN
        UPDATE users u
        SET student_id = s.id
        FROM students s
        WHERE s.user_id = u.id
          AND s.school_id = u.school_id
          AND u.student_id IS NULL;
    END IF;
END $$;
