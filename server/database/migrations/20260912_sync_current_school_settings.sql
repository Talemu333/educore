-- Bring isolated school databases in line with the current school_settings schema.
-- The current production schema reference is the latest database dump, not
-- server/database/schema/. This migration is intentionally idempotent so it
-- can repair existing school databases as well as provision new ones.

ALTER TABLE school_settings
    ADD COLUMN IF NOT EXISTS student_prefix VARCHAR(20) DEFAULT 'EDU',
    ADD COLUMN IF NOT EXISTS teacher_prefix VARCHAR(20) DEFAULT 'TCH',
    ADD COLUMN IF NOT EXISTS parent_prefix VARCHAR(20) DEFAULT 'PAR',
    ADD COLUMN IF NOT EXISTS school_logo VARCHAR,
    ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) DEFAULT '#1D4ED8',
    ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20) DEFAULT '#FFFFFF',
    ADD COLUMN IF NOT EXISTS current_session_id INTEGER,
    ADD COLUMN IF NOT EXISTS current_term_id INTEGER,
    ADD COLUMN IF NOT EXISTS ca_max_score NUMERIC(5,2) DEFAULT 40,
    ADD COLUMN IF NOT EXISTS exam_max_score NUMERIC(5,2) DEFAULT 60,
    ADD COLUMN IF NOT EXISTS passing_score NUMERIC(5,2) DEFAULT 50;

UPDATE school_settings
SET student_prefix = COALESCE(student_prefix, 'EDU'),
    teacher_prefix = COALESCE(teacher_prefix, 'TCH'),
    parent_prefix = COALESCE(parent_prefix, 'PAR'),
    primary_color = COALESCE(primary_color, '#1D4ED8'),
    secondary_color = COALESCE(secondary_color, '#FFFFFF'),
    ca_max_score = COALESCE(ca_max_score, 40),
    exam_max_score = COALESCE(exam_max_score, 60),
    passing_score = COALESCE(passing_score, 50);

DO $$
BEGIN
    IF to_regclass('public.academic_sessions') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM pg_constraint
           WHERE conname = 'school_settings_current_session_fk'
             AND conrelid = 'public.school_settings'::regclass
       ) THEN
        ALTER TABLE school_settings
            ADD CONSTRAINT school_settings_current_session_fk
            FOREIGN KEY (current_session_id)
            REFERENCES academic_sessions(id)
            ON DELETE SET NULL;
    END IF;

    IF to_regclass('public.terms') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM pg_constraint
           WHERE conname = 'school_settings_current_term_fk'
             AND conrelid = 'public.school_settings'::regclass
       ) THEN
        ALTER TABLE school_settings
            ADD CONSTRAINT school_settings_current_term_fk
            FOREIGN KEY (current_term_id)
            REFERENCES terms(id)
            ON DELETE SET NULL;
    END IF;
END $$;
