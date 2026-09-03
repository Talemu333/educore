BEGIN;

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES school_settings(school_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(40),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_messages_status_check
        CHECK (status IN ('unread', 'read', 'responded'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_school_id
    ON contact_messages (school_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_school_status
    ON contact_messages (school_id, status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
    ON contact_messages (created_at DESC);

COMMIT;
