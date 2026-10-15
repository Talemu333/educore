ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS class_ids INTEGER[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS arm_ids INTEGER[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS student_ids INTEGER[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_announcements_school_pinned
    ON announcements (school_id, is_pinned DESC, publish_date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS announcement_reads (
    school_id INTEGER NOT NULL,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (school_id, announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user
    ON announcement_reads (school_id, user_id, read_at DESC);
