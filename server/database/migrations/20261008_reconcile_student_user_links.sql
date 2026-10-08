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
