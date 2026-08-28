BEGIN;

-- Make academic sessions and terms tenant-aware.
-- Existing legacy calendar rows are assigned to School 1 when they cannot
-- be mapped through school_settings.current_session_id.

ALTER TABLE academic_sessions
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

ALTER TABLE terms
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

-- First infer session ownership from each school's current session setting.
UPDATE academic_sessions a
SET school_id = ss.school_id
FROM school_settings ss
WHERE ss.current_session_id = a.id
  AND a.school_id IS NULL;

-- Legacy sessions that pre-date multi-school support and have no explicit
-- current-session mapping are assigned to the original/demo school.
UPDATE academic_sessions
SET school_id = 1
WHERE school_id IS NULL;

-- Terms inherit ownership from their academic session.
UPDATE terms t
SET school_id = a.school_id
FROM academic_sessions a
WHERE a.id = t.session_id
  AND t.school_id IS NULL;

-- Refuse to continue if any calendar row still has no school owner.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM academic_sessions WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'Academic session migration failed: one or more sessions have no school_id.';
    END IF;

    IF EXISTS (SELECT 1 FROM terms WHERE school_id IS NULL) THEN
        RAISE EXCEPTION 'Academic term migration failed: one or more terms have no school_id.';
    END IF;
END $$;

-- Remove global session-name uniqueness; the same academic year may exist
-- independently for different schools.
ALTER TABLE academic_sessions
    DROP CONSTRAINT IF EXISTS uq_session_name;

ALTER TABLE academic_sessions
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE terms
    ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE academic_sessions
    ADD CONSTRAINT fk_academic_session_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE RESTRICT;

ALTER TABLE academic_sessions
    ADD CONSTRAINT uq_school_session_name
    UNIQUE (school_id, session_name);

-- Needed for the composite term -> session ownership constraint below.
ALTER TABLE academic_sessions
    ADD CONSTRAINT uq_academic_session_id_school
    UNIQUE (id, school_id);

ALTER TABLE terms
    ADD CONSTRAINT fk_term_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE RESTRICT;

ALTER TABLE terms
    DROP CONSTRAINT IF EXISTS uq_session_term;

ALTER TABLE terms
    ADD CONSTRAINT uq_school_session_term
    UNIQUE (school_id, session_id, term_name);

-- A term must belong to a session owned by the same school.
ALTER TABLE terms
    ADD CONSTRAINT fk_term_session_school
    FOREIGN KEY (session_id, school_id)
    REFERENCES academic_sessions(id, school_id)
    ON DELETE RESTRICT;

-- Only one current session per school.
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_current_session_per_school
    ON academic_sessions (school_id)
    WHERE is_current = TRUE;

-- Only one current term per school/session.
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_current_term_per_school_session
    ON terms (school_id, session_id)
    WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_academic_sessions_school_id
    ON academic_sessions (school_id);

CREATE INDEX IF NOT EXISTS idx_terms_school_id
    ON terms (school_id);

CREATE INDEX IF NOT EXISTS idx_terms_school_session
    ON terms (school_id, session_id);

COMMIT;
