-- Prevent duplicate class names within the same school database.
-- Existing duplicate records are deliberately left untouched for a safe, explicit data cleanup.
CREATE OR REPLACE FUNCTION prevent_duplicate_school_class_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    normalized_name TEXT;
BEGIN
    normalized_name := LOWER(REGEXP_REPLACE(BTRIM(COALESCE(NEW.class_name, '')), '[[:space:]]+', ' ', 'g'));

    IF normalized_name = '' THEN
        RETURN NEW;
    END IF;

    -- Serialize concurrent inserts/renames for the same normalized class name.
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.school_id::TEXT || ':' || normalized_name, 0));

    IF EXISTS (
        SELECT 1
        FROM classes c
        WHERE c.school_id = NEW.school_id
          AND c.id IS DISTINCT FROM NEW.id
          AND LOWER(REGEXP_REPLACE(BTRIM(COALESCE(c.class_name, '')), '[[:space:]]+', ' ', 'g')) = normalized_name
    ) THEN
        RAISE EXCEPTION 'A class with this name already exists in this school.'
            USING ERRCODE = '23505',
                  CONSTRAINT = 'classes_school_normalized_name_unique';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_duplicate_school_class_name ON classes;
CREATE TRIGGER trg_prevent_duplicate_school_class_name
BEFORE INSERT OR UPDATE OF class_name, school_id
ON classes
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_school_class_name();
