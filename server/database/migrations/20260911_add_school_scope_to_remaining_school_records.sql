BEGIN;

-- These tables are school-owned but were created before the multischool
-- boundary was completed. Keep the current shared database working while
-- adding an explicit school boundary that will later guide database routing.

-- -------------------------------------------------------------------------
-- STUDENT RESULTS
-- -------------------------------------------------------------------------
ALTER TABLE student_results
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_results r
SET school_id = s.school_id
FROM students s
WHERE s.id = r.student_id
  AND r.school_id IS NULL;

UPDATE student_results r
SET school_id = t.school_id
FROM teacher_assignments ta
JOIN teachers t ON t.id = ta.teacher_id
WHERE ta.id = r.teacher_assignment_id
  AND r.school_id IS NULL;

UPDATE student_results
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE student_results
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_result_school'
          AND conrelid = 'student_results'::regclass
    ) THEN
        ALTER TABLE student_results
            ADD CONSTRAINT fk_student_result_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_results_school_id
    ON student_results(school_id);

-- -------------------------------------------------------------------------
-- ATTENDANCE
-- -------------------------------------------------------------------------
ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE attendance a
SET school_id = s.school_id
FROM students s
WHERE s.id = a.student_id
  AND a.school_id IS NULL;

UPDATE attendance
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE attendance
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_attendance_school'
          AND conrelid = 'attendance'::regclass
    ) THEN
        ALTER TABLE attendance
            ADD CONSTRAINT fk_attendance_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_school_id
    ON attendance(school_id);

CREATE INDEX IF NOT EXISTS idx_attendance_school_date
    ON attendance(school_id, attendance_date DESC);

-- -------------------------------------------------------------------------
-- FEE STRUCTURES
-- Fee types remain a shared reference catalogue for now because legacy fee
-- type rows cannot always be assigned to one school without ambiguity.
-- -------------------------------------------------------------------------
ALTER TABLE fee_structures
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE fee_structures fs
SET school_id = c.school_id
FROM classes c
WHERE c.id = fs.class_id
  AND fs.school_id IS NULL;

UPDATE fee_structures
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE fee_structures
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_fee_structure_school'
          AND conrelid = 'fee_structures'::regclass
    ) THEN
        ALTER TABLE fee_structures
            ADD CONSTRAINT fk_fee_structure_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fee_structures_school_id
    ON fee_structures(school_id);

-- -------------------------------------------------------------------------
-- STUDENT PAYMENTS
-- -------------------------------------------------------------------------
ALTER TABLE student_payments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_payments p
SET school_id = s.school_id
FROM students s
WHERE s.id = p.student_id
  AND p.school_id IS NULL;

UPDATE student_payments
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE student_payments
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_student_payment_school'
          AND conrelid = 'student_payments'::regclass
    ) THEN
        ALTER TABLE student_payments
            ADD CONSTRAINT fk_student_payment_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_payments_school_id
    ON student_payments(school_id);

CREATE INDEX IF NOT EXISTS idx_student_payments_school_date
    ON student_payments(school_id, payment_date DESC);

-- -------------------------------------------------------------------------
-- NOTIFICATIONS
-- Notifications belong to the school of their recipient. Platform-level
-- notifications for users without a school remain nullable.
-- -------------------------------------------------------------------------
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE notifications n
SET school_id = u.school_id
FROM users u
WHERE u.id = n.user_id
  AND n.school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_notification_school'
          AND conrelid = 'notifications'::regclass
    ) THEN
        ALTER TABLE notifications
            ADD CONSTRAINT fk_notification_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_school_id
    ON notifications(school_id);

CREATE INDEX IF NOT EXISTS idx_notifications_school_user
    ON notifications(school_id, user_id, created_at DESC);

-- -------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- Announcements are school-owned. Legacy rows created by a school user can
-- be resolved from that user's school; rows without an identifiable school
-- are temporarily assigned to School 1 for the existing shared deployment.
-- -------------------------------------------------------------------------
ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE announcements a
SET school_id = u.school_id
FROM users u
WHERE u.id = a.created_by
  AND a.school_id IS NULL;

UPDATE announcements
SET school_id = 1
WHERE school_id IS NULL;

ALTER TABLE announcements
    ALTER COLUMN school_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_announcement_school'
          AND conrelid = 'announcements'::regclass
    ) THEN
        ALTER TABLE announcements
            ADD CONSTRAINT fk_announcement_school
            FOREIGN KEY (school_id)
            REFERENCES schools(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_announcements_school_id
    ON announcements(school_id);

CREATE INDEX IF NOT EXISTS idx_announcements_school_active
    ON announcements(school_id, is_active, publish_date DESC);

COMMIT;
