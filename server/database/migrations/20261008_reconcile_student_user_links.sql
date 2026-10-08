-- Reconcile both historical student/account link shapes used by Eduprow.
-- The student-account feature uses users.student_id, while the original
-- database schema also contains students.user_id. Existing school databases
-- can therefore contain either shape or both. Keep both columns available and
-- reconcile only missing links; never overwrite an existing conflicting link.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS student_id INTEGER;

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

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

-- First recover the established users.student_id link from older
-- students.user_id data, but only where users.student_id is empty.
UPDATE users u
SET student_id = s.id
FROM students s
WHERE s.user_id = u.id
  AND s.school_id = u.school_id
  AND u.student_id IS NULL;

-- Then recover the original students.user_id link from the newer
-- users.student_id data, but only where students.user_id is empty.
UPDATE students s
SET user_id = u.id
FROM users u
WHERE u.student_id = s.id
  AND u.school_id = s.school_id
  AND s.user_id IS NULL;
