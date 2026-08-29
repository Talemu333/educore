BEGIN;

-- Classes and arms were created before multi-school support. The current
-- services already scope both resources by school_id, so the database must
-- carry the same tenant ownership.

ALTER TABLE classes
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

ALTER TABLE arms
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- Existing legacy class records belong to the original/demo school.
UPDATE classes
SET school_id = 1
WHERE school_id IS NULL;

-- Arms inherit ownership from their class.
UPDATE arms a
SET school_id = c.school_id
FROM classes c
WHERE a.class_id = c.id
  AND a.school_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM classes WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'Class migration failed: one or more classes have no school_id.';
    END IF;

    IF EXISTS (SELECT 1 FROM arms WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'Arm migration failed: one or more arms have no school_id.';
    END IF;
END $$;

-- Replace global uniqueness with school-scoped uniqueness.
ALTER TABLE classes
    DROP CONSTRAINT IF EXISTS uq_class_name;

ALTER TABLE classes
    DROP CONSTRAINT IF EXISTS uq_sort_order;

ALTER TABLE arms
    DROP CONSTRAINT IF EXISTS uq_arm_name;

ALTER TABLE classes
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE arms
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE classes
    ADD CONSTRAINT fk_class_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE RESTRICT;

ALTER TABLE classes
    ADD CONSTRAINT uq_school_class_name
    UNIQUE (school_id, class_name);

ALTER TABLE classes
    ADD CONSTRAINT uq_school_class_sort_order
    UNIQUE (school_id, sort_order);

ALTER TABLE classes
    ADD CONSTRAINT uq_class_id_school
    UNIQUE (id, school_id);

ALTER TABLE arms
    ADD CONSTRAINT fk_arm_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE RESTRICT;

ALTER TABLE arms
    ADD CONSTRAINT uq_school_arm_name
    UNIQUE (school_id, arm_name);

ALTER TABLE arms
    ADD CONSTRAINT fk_arm_class_school
    FOREIGN KEY (class_id, school_id)
    REFERENCES classes(id, school_id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_classes_school_id
    ON classes (school_id);

CREATE INDEX IF NOT EXISTS idx_arms_school_id
    ON arms (school_id);

CREATE INDEX IF NOT EXISTS idx_arms_school_class
    ON arms (school_id, class_id);

COMMIT;
