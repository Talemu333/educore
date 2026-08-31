-- Allow the multischool academic structure to support Nursery, Primary,
-- Junior Secondary and Senior Secondary classes.

ALTER TABLE classes
DROP CONSTRAINT IF EXISTS chk_class_level;

ALTER TABLE classes
ADD CONSTRAINT chk_class_level
CHECK (
    class_level IN ('Nursery', 'Primary', 'Junior', 'Senior')
);
