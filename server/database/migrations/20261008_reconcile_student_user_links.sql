-- Reconcile both historical student/account link shapes used by Eduprow.
-- Every school database must expose the same student-login schema as the model
-- database. This migration is deliberately idempotent and repairs older
-- school databases without overwriting existing conflicting links.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS student_id INTEGER;

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS user_id INTEGER,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users
    ALTER COLUMN email DROP NOT NULL;

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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_user'
          AND conrelid = 'students'::regclass
    ) THEN
        ALTER TABLE students
            ADD CONSTRAINT fk_student_user
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_student_id
    ON users(student_id)
    WHERE student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_student_id
    ON users(student_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_students_user_id
    ON students(user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_user_id
    ON students(user_id);

DO $$
BEGIN
    IF to_regclass('public.roles') IS NOT NULL
       AND EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'roles'
             AND column_name = 'role_name'
       )
       AND NOT EXISTS (
           SELECT 1 FROM roles WHERE LOWER(role_name) = 'student'
       ) THEN
        INSERT INTO roles (role_name) VALUES ('student');
    END IF;
END $$;

UPDATE users u
SET student_id = s.id
FROM students s
WHERE s.user_id = u.id
  AND s.school_id = u.school_id
  AND u.student_id IS NULL;

UPDATE students s
SET user_id = u.id
FROM users u
WHERE u.student_id = s.id
  AND u.school_id = s.school_id
  AND s.user_id IS NULL;
