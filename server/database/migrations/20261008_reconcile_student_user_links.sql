-- Establish the canonical students.user_id relationship for every
-- dedicated school database. Older databases may not have this column yet.

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'students_user_id_fkey'
          AND conrelid = 'students'::regclass
    ) THEN
        ALTER TABLE students
            ADD CONSTRAINT students_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_user_id_school
    ON students(user_id, school_id);

-- Keep existing student login accounts compatible with the current
-- students.user_id relationship. Older releases temporarily stored the
-- relationship in users.student_id.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'student_id'
    ) THEN
        EXECUTE $sql$
            UPDATE students s
            SET user_id = u.id,
                updated_at = CURRENT_TIMESTAMP
            FROM users u
            WHERE u.student_id = s.id
              AND u.school_id = s.school_id
              AND s.user_id IS NULL
        $sql$;
    END IF;
END $$;
