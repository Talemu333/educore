CREATE UNIQUE INDEX IF NOT EXISTS uq_announcements_id_school
    ON announcements (id, school_id);

CREATE TABLE IF NOT EXISTS announcement_attachments (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    announcement_id INTEGER NOT NULL,
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
    file_data BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_attachments_school_announcement
        FOREIGN KEY (announcement_id, school_id)
        REFERENCES announcements(id, school_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_announcement_attachments_lookup
    ON announcement_attachments (school_id, announcement_id, created_at);
