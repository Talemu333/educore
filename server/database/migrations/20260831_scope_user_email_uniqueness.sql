-- Make user email uniqueness school-scoped for the multischool platform.
-- This allows the same email address to exist in different schools while
-- preventing duplicate emails within the same school.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS users_school_id_email_unique
    ON users (school_id, LOWER(email));
