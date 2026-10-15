-- Announcement enhancements: per-user read tracking, pinning, links, and class/arm targeting.
ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS attachment_url TEXT,
    ADD COLUMN IF NOT EXISTS attachment_label VARCHAR(160),
    ADD COLUMN IF NOT EXISTS target_class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS target_arm_id INTEGER REFERENCES arms(id) ON DELETE SET NULL;

ALTER TABLE announcements
    DROP CONSTRAINT IF EXISTS announcements_audience_check;

ALTER TABLE announcements
    ADD CONSTRAINT announcements_audience_check
    CHECK (audience IN ('all', 'students', 'teachers', 'parents', 'administrators', 'class'));

ALTER TABLE announcements
    DROP CONSTRAINT IF EXISTS chk_announcement_target;

ALTER TABLE announcements
    ADD CONSTRAINT chk_announcement_target
    CHECK (
        (audience = 'class' AND target_class_id IS NOT NULL)
        OR (audience <> 'class' AND target_class_id IS NULL AND target_arm_id IS NULL)
    );

ALTER TABLE announcements
    DROP CONSTRAINT IF EXISTS chk_announcement_target_arm;

ALTER TABLE announcements
    ADD CONSTRAINT chk_announcement_target_arm
    CHECK (target_arm_id IS NULL OR target_class_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_announcements_target
    ON announcements (school_id, target_class_id, target_arm_id, is_active, publish_date DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned
    ON announcements (school_id, is_pinned DESC, publish_date DESC)
    WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS announcement_reads (
    id BIGSERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_announcement_read_per_user UNIQUE (school_id, announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user
    ON announcement_reads (school_id, user_id, read_at DESC);
