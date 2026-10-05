BEGIN;

-- Canonical multischool schema for every dedicated school database.
-- New databases run this after the base schema; existing databases receive
-- the same additions idempotently.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS admin_type VARCHAR(20);

ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS school_id INTEGER,
    ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT TRUE;

UPDATE subjects
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subject_school' AND conrelid = 'subjects'::regclass) THEN
        ALTER TABLE subjects ADD CONSTRAINT fk_subject_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);

ALTER TABLE class_subjects
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE class_subjects cs
SET school_id = c.school_id
FROM classes c
WHERE c.id = cs.class_id
  AND cs.school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_class_subject_school' AND conrelid = 'class_subjects'::regclass) THEN
        ALTER TABLE class_subjects ADD CONSTRAINT fk_class_subject_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_subjects_school_id ON class_subjects(school_id);

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE students
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_student_school' AND conrelid = 'students'::regclass) THEN
        ALTER TABLE students ADD CONSTRAINT fk_student_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

ALTER TABLE teachers
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE teachers
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_teacher_school' AND conrelid = 'teachers'::regclass) THEN
        ALTER TABLE teachers ADD CONSTRAINT fk_teacher_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);

ALTER TABLE parents
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE parents p
SET school_id = u.school_id
FROM users u
WHERE p.user_id = u.id
  AND p.school_id IS NULL;

UPDATE parents
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parent_school' AND conrelid = 'parents'::regclass) THEN
        ALTER TABLE parents ADD CONSTRAINT fk_parent_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parents_school_id ON parents(school_id);

ALTER TABLE student_results
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_results r
SET school_id = s.school_id
FROM students s
WHERE s.id = r.student_id
  AND r.school_id IS NULL;

UPDATE student_results
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_student_result_school' AND conrelid = 'student_results'::regclass) THEN
        ALTER TABLE student_results ADD CONSTRAINT fk_student_result_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_results_school_id ON student_results(school_id);

ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE attendance a
SET school_id = s.school_id
FROM students s
WHERE s.id = a.student_id
  AND a.school_id IS NULL;

UPDATE attendance
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_school' AND conrelid = 'attendance'::regclass) THEN
        ALTER TABLE attendance ADD CONSTRAINT fk_attendance_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON attendance(school_id);

ALTER TABLE fee_structures
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE fee_structures fs
SET school_id = c.school_id
FROM classes c
WHERE c.id = fs.class_id
  AND fs.school_id IS NULL;

UPDATE fee_structures
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fee_structure_school' AND conrelid = 'fee_structures'::regclass) THEN
        ALTER TABLE fee_structures ADD CONSTRAINT fk_fee_structure_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fee_structures_school_id ON fee_structures(school_id);

ALTER TABLE student_payments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE student_payments p
SET school_id = s.school_id
FROM students s
WHERE s.id = p.student_id
  AND p.school_id IS NULL;

UPDATE student_payments
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_student_payment_school' AND conrelid = 'student_payments'::regclass) THEN
        ALTER TABLE student_payments ADD CONSTRAINT fk_student_payment_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_payments_school_id ON student_payments(school_id);

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE notifications n
SET school_id = u.school_id
FROM users u
WHERE u.id = n.user_id
  AND n.school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notification_school' AND conrelid = 'notifications'::regclass) THEN
        ALTER TABLE notifications ADD CONSTRAINT fk_notification_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON notifications(school_id);

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE announcements a
SET school_id = u.school_id
FROM users u
WHERE u.id = a.created_by
  AND a.school_id IS NULL;

UPDATE announcements
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_announcement_school' AND conrelid = 'announcements'::regclass) THEN
        ALTER TABLE announcements ADD CONSTRAINT fk_announcement_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

ALTER TABLE departments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE departments
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_department_school' AND conrelid = 'departments'::regclass) THEN
        ALTER TABLE departments ADD CONSTRAINT fk_department_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_departments_school_id ON departments(school_id);

ALTER TABLE fee_types
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE fee_types
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fee_type_school' AND conrelid = 'fee_types'::regclass) THEN
        ALTER TABLE fee_types ADD CONSTRAINT fk_fee_type_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fee_types_school_id ON fee_types(school_id);

ALTER TABLE teacher_assignments
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE teacher_assignments ta
SET school_id = t.school_id
FROM teachers t
WHERE t.id = ta.teacher_id
  AND ta.school_id IS NULL;

UPDATE teacher_assignments
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_teacher_assignment_school' AND conrelid = 'teacher_assignments'::regclass) THEN
        ALTER TABLE teacher_assignments ADD CONSTRAINT fk_teacher_assignment_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $;

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_id ON teacher_assignments(school_id);

ALTER TABLE timetables
    ADD COLUMN IF NOT EXISTS school_id INTEGER;

UPDATE timetables t
SET school_id = ta.school_id
FROM teacher_assignments ta
WHERE ta.id = t.teacher_assignment_id
  AND t.school_id IS NULL;

UPDATE timetables
SET school_id = (SELECT id FROM schools ORDER BY id LIMIT 1)
WHERE school_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_timetable_school' AND conrelid = 'timetables'::regclass) THEN
        ALTER TABLE timetables ADD CONSTRAINT fk_timetable_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_timetables_school_id ON timetables(school_id);

ALTER TABLE subjects ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE class_subjects ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE students ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE teachers ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE parents ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE student_results ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE attendance ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE fee_structures ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE student_payments ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE announcements ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE departments ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE fee_types ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE timetables ALTER COLUMN school_id SET NOT NULL;

COMMIT;
