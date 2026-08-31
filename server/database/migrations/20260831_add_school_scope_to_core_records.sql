BEGIN;

-- Complete the tenant boundary for the core records that are created
-- directly by a school administrator. Legacy records belong to School 1.
-- The migration is intentionally idempotent because some local databases
-- already contain these columns from earlier manual migration work.

-- -------------------------------------------------------------------------
-- SUBJECTS
-- -------------------------------------------------------------------------
ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE subjects
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE subjects
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE subjects
    DROP CONSTRAINT IF EXISTS uq_subject_name;

ALTER TABLE subjects
    DROP CONSTRAINT IF EXISTS uq_subject_code;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_subject_school'
          AND conrelid = 'subjects'::regclass
    ) THEN
        ALTER TABLE subjects
            ADD CONSTRAINT fk_subject_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_subject_school_name'
          AND conrelid = 'subjects'::regclass
    ) THEN
        ALTER TABLE subjects
            ADD CONSTRAINT uq_subject_school_name
            UNIQUE (school_id, subject_name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_subject_school_code'
          AND conrelid = 'subjects'::regclass
    ) THEN
        ALTER TABLE subjects
            ADD CONSTRAINT uq_subject_school_code
            UNIQUE (school_id, subject_code);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subjects_school_id
    ON subjects(school_id);

-- -------------------------------------------------------------------------
-- STUDENTS
-- -------------------------------------------------------------------------
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE students
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE students
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE students
    DROP CONSTRAINT IF EXISTS students_admission_number_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_school'
          AND conrelid = 'students'::regclass
    ) THEN
        ALTER TABLE students
            ADD CONSTRAINT fk_student_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_student_school_admission_number'
          AND conrelid = 'students'::regclass
    ) THEN
        ALTER TABLE students
            ADD CONSTRAINT uq_student_school_admission_number
            UNIQUE (school_id, admission_number);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_student_school_admission_sequence'
          AND conrelid = 'students'::regclass
    ) THEN
        ALTER TABLE students
            ADD CONSTRAINT uq_student_school_admission_sequence
            UNIQUE (school_id, admission_sequence);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_school_id
    ON students(school_id);

CREATE INDEX IF NOT EXISTS idx_students_school_class_arm
    ON students(school_id, class_id, arm_id);

-- -------------------------------------------------------------------------
-- TEACHERS
-- -------------------------------------------------------------------------
ALTER TABLE teachers
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE teachers
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE teachers
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE teachers
    DROP CONSTRAINT IF EXISTS teachers_staff_number_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_teacher_school'
          AND conrelid = 'teachers'::regclass
    ) THEN
        ALTER TABLE teachers
            ADD CONSTRAINT fk_teacher_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_teacher_school_staff_number'
          AND conrelid = 'teachers'::regclass
    ) THEN
        ALTER TABLE teachers
            ADD CONSTRAINT uq_teacher_school_staff_number
            UNIQUE (school_id, staff_number);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teachers_school_id
    ON teachers(school_id);

-- -------------------------------------------------------------------------
-- PARENTS
-- -------------------------------------------------------------------------
ALTER TABLE parents
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE parents
SET school_id = u.school_id
FROM users u
WHERE parents.user_id = u.id
  AND parents.school_id IS NULL;

UPDATE parents
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE parents
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_parent_school'
          AND conrelid = 'parents'::regclass
    ) THEN
        ALTER TABLE parents
            ADD CONSTRAINT fk_parent_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parents_school_id
    ON parents(school_id);

COMMIT;
