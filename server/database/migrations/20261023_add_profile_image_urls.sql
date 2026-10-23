-- Cloudinary profile image URLs only; no image binaries are stored by EduProw.
-- Safe to re-run against each school's database.
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE IF EXISTS students
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE IF EXISTS teachers
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE IF EXISTS parents
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Keep blank values normalized while allowing existing accounts to remain unchanged.
UPDATE users SET profile_image_url = NULL WHERE BTRIM(COALESCE(profile_image_url, '')) = '';
UPDATE students SET profile_image_url = NULL WHERE BTRIM(COALESCE(profile_image_url, '')) = '';
UPDATE teachers SET profile_image_url = NULL WHERE BTRIM(COALESCE(profile_image_url, '')) = '';
UPDATE parents SET profile_image_url = NULL WHERE BTRIM(COALESCE(profile_image_url, '')) = '';
