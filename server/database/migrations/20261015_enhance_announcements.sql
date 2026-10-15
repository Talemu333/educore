CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (audience IN ('all','students','teachers','parents','administrators')),
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_announcement_dates CHECK (expiry_date IS NULL OR expiry_date >= publish_date)
);

CREATE INDEX IF NOT EXISTS idx_announcements_school_active ON announcements (school_id,is_active,publish_date DESC);
ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS class_ids INTEGER[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS arm_ids INTEGER[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS student_ids INTEGER[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_announcements_school_pinned ON announcements (school_id,is_pinned DESC,publish_date DESC,created_at DESC);

CREATE TABLE IF NOT EXISTS announcement_reads (
    school_id INTEGER NOT NULL,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (school_id,announcement_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads (school_id,user_id,read_at DESC);
