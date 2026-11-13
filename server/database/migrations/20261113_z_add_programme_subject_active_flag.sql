-- Keep programme subject history referentially valid when a school changes
-- its offered subjects. Historical student registrations continue referencing
-- the offering row while the offering can be deactivated for future enrolments.

BEGIN;

ALTER TABLE academic_programme_subjects
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_programme_subjects_active
    ON academic_programme_subjects (school_id, programme_id, subject_id)
    WHERE is_active = TRUE;

COMMIT;
