-- Repair constraints that existed in older dedicated-school bootstrap schemas.
-- The current central schema allows the same arm name in different classes;
-- uniqueness is scoped to (class_id, arm_name), not (school_id, arm_name).

ALTER TABLE arms
    DROP CONSTRAINT IF EXISTS uq_school_arm_name;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.arms'::regclass
          AND conname = 'uq_class_arm'
    ) THEN
        ALTER TABLE arms
            ADD CONSTRAINT uq_class_arm UNIQUE (class_id, arm_name);
    END IF;
END
$$;
