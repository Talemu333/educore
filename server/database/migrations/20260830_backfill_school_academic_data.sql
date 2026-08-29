BEGIN;

-- The initial multi-school migrations assigned legacy academic data to
-- School 1. New schools therefore have no classes, arms or terms unless
-- they were created manually. Backfill the existing academic structure
-- into every school while preserving any school-specific records already
-- present.

-- -------------------------------------------------------------------------
-- CLASSES
-- -------------------------------------------------------------------------

INSERT INTO classes (
    school_id,
    class_name,
    class_level,
    sort_order
)
SELECT
    school.id,
    source.class_name,
    source.class_level,
    source.sort_order
FROM schools school
CROSS JOIN classes source
WHERE source.school_id = 1
  AND school.id <> 1
ON CONFLICT (school_id, class_name) DO NOTHING;

-- -------------------------------------------------------------------------
-- ARMS
-- -------------------------------------------------------------------------

INSERT INTO arms (
    school_id,
    class_id,
    arm_name
)
SELECT
    target_class.school_id,
    target_class.id,
    source_arm.arm_name
FROM arms source_arm
INNER JOIN classes source_class
    ON source_class.id = source_arm.class_id
   AND source_class.school_id = 1
INNER JOIN classes target_class
    ON target_class.class_name = source_class.class_name
CROSS JOIN schools school
WHERE source_arm.school_id = 1
  AND target_class.school_id = school.id
  AND school.id <> 1
ON CONFLICT (school_id, arm_name) DO NOTHING;

-- -------------------------------------------------------------------------
-- TERMS
-- -------------------------------------------------------------------------
-- Use School 1's existing term definitions as the canonical defaults.
-- Every academic session in every other school receives the same term
-- structure when that term does not already exist. Dates are shifted by
-- the offset from the canonical session's start date.

INSERT INTO terms (
    school_id,
    session_id,
    term_name,
    start_date,
    end_date,
    is_current
)
SELECT
    target_session.school_id,
    target_session.id,
    source_term.term_name,
    target_session.start_date
        + (source_term.start_date - source_session.start_date),
    target_session.start_date
        + (source_term.end_date - source_session.start_date),
    CASE
        WHEN source_term.is_current = TRUE
             AND target_session.is_current = TRUE
        THEN TRUE
        ELSE FALSE
    END
FROM terms source_term
INNER JOIN academic_sessions source_session
    ON source_session.id = source_term.session_id
   AND source_session.school_id = 1
CROSS JOIN academic_sessions target_session
WHERE source_term.school_id = 1
  AND target_session.school_id <> 1
ON CONFLICT (school_id, session_id, term_name) DO NOTHING;

COMMIT;
