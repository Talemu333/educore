BEGIN;

-- Relationship records also need an explicit tenant boundary. The application
-- already knows the authenticated school, but these tables must enforce that
-- boundary at the database level as well.

-- -------------------------------------------------------------------------
-- STUDENT ENROLLMENTS
-- -------------------------------------------------------------------------
ALTER TABLE student_enrollments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_enrollments se
SET school_id = s.school_id
FROM students s
WHERE se.student_id = s.id
  AND se.school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM student_enrollments WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'student_enrollments contains rows that cannot be assigned to a school';
    END IF;
END $$;

ALTER TABLE student_enrollments
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_enrollment_school'
          AND conrelid = 'student_enrollments'::regclass
    ) THEN
        ALTER TABLE student_enrollments
            ADD CONSTRAINT fk_student_enrollment_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_enrollments_school_id
    ON student_enrollments(school_id);

-- -------------------------------------------------------------------------
-- STUDENT / PARENT LINKS
-- -------------------------------------------------------------------------
ALTER TABLE student_parents
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_parents sp
SET school_id = s.school_id
FROM students s
WHERE sp.student_id = s.id
  AND sp.school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM student_parents WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'student_parents contains rows that cannot be assigned to a school';
    END IF;
END $$;

ALTER TABLE student_parents
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_parent_school'
          AND conrelid = 'student_parents'::regclass
    ) THEN
        ALTER TABLE student_parents
            ADD CONSTRAINT fk_student_parent_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_parents_school_id
    ON student_parents(school_id);

-- -------------------------------------------------------------------------
-- TEACHER ASSIGNMENTS
-- -------------------------------------------------------------------------
ALTER TABLE teacher_assignments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE teacher_assignments ta
SET school_id = t.school_id
FROM teachers t
WHERE ta.teacher_id = t.id
  AND ta.school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM teacher_assignments WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'teacher_assignments contains rows that cannot be assigned to a school';
    END IF;
END $$;

ALTER TABLE teacher_assignments
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_teacher_assignment_school'
          AND conrelid = 'teacher_assignments'::regclass
    ) THEN
        ALTER TABLE teacher_assignments
            ADD CONSTRAINT fk_teacher_assignment_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_id
    ON teacher_assignments(school_id);

-- -------------------------------------------------------------------------
-- DATABASE-LEVEL SCHOOL INFERENCE FOR LEGACY INSERT CALLS
-- -------------------------------------------------------------------------
-- These triggers make the existing creation flows safe even when their INSERT
-- statements do not yet explicitly include school_id. The school is derived
-- from the owning record, never from client-supplied input.

CREATE OR REPLACE FUNCTION set_student_enrollment_school_id()
RETURNS TRIGGER AS $$
BEGIN
    SELECT school_id INTO NEW.school_id
    FROM students
    WHERE id = NEW.student_id;

    IF NEW.school_id IS NULL THEN
        RAISE EXCEPTION 'Student does not have a school context';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_enrollment_school_id ON student_enrollments;
CREATE TRIGGER trg_student_enrollment_school_id
BEFORE INSERT OR UPDATE OF student_id ON student_enrollments
FOR EACH ROW
EXECUTE FUNCTION set_student_enrollment_school_id();

CREATE OR REPLACE FUNCTION set_student_parent_school_id()
RETURNS TRIGGER AS $$
DECLARE
    student_school INTEGER;
    parent_school INTEGER;
BEGIN
    SELECT school_id INTO student_school
    FROM students
    WHERE id = NEW.student_id;

    SELECT school_id INTO parent_school
    FROM parents
    WHERE id = NEW.parent_id;

    IF student_school IS NULL OR parent_school IS NULL THEN
        RAISE EXCEPTION 'Student and parent must belong to a school';
    END IF;

    IF student_school <> parent_school THEN
        RAISE EXCEPTION 'Student and parent must belong to the same school';
    END IF;

    NEW.school_id := student_school;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_parent_school_id ON student_parents;
CREATE TRIGGER trg_student_parent_school_id
BEFORE INSERT OR UPDATE OF student_id, parent_id ON student_parents
FOR EACH ROW
EXECUTE FUNCTION set_student_parent_school_id();

CREATE OR REPLACE FUNCTION set_teacher_assignment_school_id()
RETURNS TRIGGER AS $$
DECLARE
    teacher_school INTEGER;
BEGIN
    SELECT school_id INTO teacher_school
    FROM teachers
    WHERE id = NEW.teacher_id;

    IF teacher_school IS NULL THEN
        RAISE EXCEPTION 'Teacher does not have a school context';
    END IF;

    NEW.school_id := teacher_school;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teacher_assignment_school_id ON teacher_assignments;
CREATE TRIGGER trg_teacher_assignment_school_id
BEFORE INSERT OR UPDATE OF teacher_id ON teacher_assignments
FOR EACH ROW
EXECUTE FUNCTION set_teacher_assignment_school_id();

COMMIT;
