-- Fill school_id automatically for relationship records whose application
-- insert statements still omit the new multischool column.

CREATE OR REPLACE FUNCTION set_student_result_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT s.school_id
        INTO NEW.school_id
        FROM students s
        WHERE s.id = NEW.student_id;
    END IF;

    IF NEW.school_id IS NULL THEN
        SELECT u.school_id
        INTO NEW.school_id
        FROM teacher_assignments ta
        JOIN teachers t ON t.id = ta.teacher_id
        JOIN users u ON u.id = t.user_id
        WHERE ta.id = NEW.teacher_assignment_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_results_school_id ON student_results;
CREATE TRIGGER trg_student_results_school_id
BEFORE INSERT OR UPDATE ON student_results
FOR EACH ROW
EXECUTE FUNCTION set_student_result_school_id();

-- Fee structures are normally created from records that already carry a
-- school_id. Keep a database-level safeguard for legacy insert paths.
CREATE OR REPLACE FUNCTION set_fee_structure_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT s.school_id
        INTO NEW.school_id
        FROM academic_sessions s
        WHERE s.id = NEW.session_id;
    END IF;

    IF NEW.school_id IS NULL THEN
        SELECT c.school_id
        INTO NEW.school_id
        FROM classes c
        WHERE c.id = NEW.class_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fee_structures_school_id ON fee_structures;
CREATE TRIGGER trg_fee_structures_school_id
BEFORE INSERT OR UPDATE ON fee_structures
FOR EACH ROW
EXECUTE FUNCTION set_fee_structure_school_id();
