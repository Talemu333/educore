BEGIN;

-- CBT scheduling/attempt timestamps must represent an actual point in time.
-- The original CBT migration used TIMESTAMP WITHOUT TIME ZONE, which can be
-- interpreted differently by PostgreSQL, Node.js, and the student's browser.
-- Convert existing values using the database session timezone, then use
-- TIMESTAMPTZ for all CBT timing fields going forward.

ALTER TABLE cbt_exams
    ALTER COLUMN starts_at TYPE TIMESTAMPTZ
        USING starts_at AT TIME ZONE current_setting('TIMEZONE'),
    ALTER COLUMN ends_at TYPE TIMESTAMPTZ
        USING ends_at AT TIME ZONE current_setting('TIMEZONE');

ALTER TABLE cbt_attempts
    ALTER COLUMN started_at TYPE TIMESTAMPTZ
        USING started_at AT TIME ZONE current_setting('TIMEZONE'),
    ALTER COLUMN submitted_at TYPE TIMESTAMPTZ
        USING submitted_at AT TIME ZONE current_setting('TIMEZONE'),
    ALTER COLUMN expires_at TYPE TIMESTAMPTZ
        USING expires_at AT TIME ZONE current_setting('TIMEZONE'),
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE current_setting('TIMEZONE'),
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE current_setting('TIMEZONE');

COMMIT;
