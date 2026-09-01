-- Safeguard promotion writes from legacy insert statements that omit school_id.

CREATE OR REPLACE FUNCTION set_enrollment_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT s.school_id INTO NEW.school_id
        FROM students s
        WHERE s.id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_enrollments_school_id ON student_enrollments;
CREATE TRIGGER trg_student_enrollments_school_id
BEFORE INSERT OR UPDATE ON student_enrollments
FOR EACH ROW EXECUTE FUNCTION set_enrollment_school_id();

CREATE OR REPLACE FUNCTION set_promotion_history_school_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.school_id IS NULL THEN
        SELECT s.school_id INTO NEW.school_id
        FROM students s
        WHERE s.id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_promotion_history_school_id ON student_promotion_history;
CREATE TRIGGER trg_promotion_history_school_id
BEFORE INSERT OR UPDATE ON student_promotion_history
FOR EACH ROW EXECUTE FUNCTION set_promotion_history_school_id();
