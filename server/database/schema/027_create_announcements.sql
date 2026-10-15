CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(50) NOT NULL DEFAULT 'all'
        CHECK (audience IN ('all', 'students', 'teachers', 'parents', 'administrators')),
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_announcement_dates CHECK (expiry_date IS NULL OR expiry_date >= publish_date)
);
CREATE INDEX idx_announcements_school_active ON announcements (school_id, is_active, publish_date DESC);
