BEGIN;

ALTER TABLE class_subjects
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- Existing class-subject assignments inherit the school of their class.
UPDATE class_subjects cs
SET school_id = c.school_id
FROM classes c
WHERE cs.class_id = c.id
  AND cs.school_id IS NULL;

-- If there are any orphaned legacy rows, stop rather than assigning them
-- to an arbitrary school.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM class_subjects WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'class_subjects contains rows that cannot be assigned to a school';
    END IF;
END $$;

ALTER TABLE class_subjects
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_class_subject_school'
          AND conrelid = 'class_subjects'::regclass
    ) THEN
        ALTER TABLE class_subjects
            ADD CONSTRAINT fk_class_subject_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_subjects_school_id
    ON class_subjects(school_id);

COMMIT;
