const { getSchoolDatabase } = require("../config/schoolDatabaseManager");

const runCheck = async (checks, name, pool, sql, values = []) => {
    try {
        const result = await pool.query(sql, values);
        checks.push({ name, ok: true, rowCount: result.rowCount, rows: result.rows });
    } catch (error) {
        checks.push({ name, ok: false, code: error.code || null, message: error.message || "Database query failed", detail: error.detail || null, hint: error.hint || null });
    }
};

const diagnostics = async (req, res, next) => {
    const schoolId = Number(req.params.id);
    if (!Number.isInteger(schoolId) || schoolId < 1) return res.status(400).json({ success: false, message: "Invalid school ID." });
    try {
        const pool = await getSchoolDatabase(schoolId);
        const checks = [];
        await runCheck(checks, "database", pool, "SELECT current_database() AS database_name, current_user AS database_user");
        await runCheck(checks, "school", pool, "SELECT id, school_name, is_active FROM schools WHERE id = $1", [schoolId]);
        await runCheck(checks, "school_settings", pool, "SELECT school_id, current_session_id, current_term_id FROM school_settings WHERE school_id = $1", [schoolId]);
        await runCheck(checks, "required_tables", pool, "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[]) ORDER BY table_name", [["schools","users","school_settings","students","teachers","parents","classes","student_enrollments","attendance","student_results","fee_structures","student_payments","announcements","expenses"]]);

        const queries = {
            students: ["SELECT COUNT(*)::integer AS total FROM students WHERE school_id = $1", [schoolId]],
            active_students: ["SELECT COUNT(DISTINCT se.student_id)::integer AS total FROM student_enrollments se JOIN students s ON s.id = se.student_id WHERE se.enrollment_status = 'Active' AND s.school_id = $1", [schoolId]],
            teachers: ["SELECT COUNT(*)::integer AS total FROM teachers WHERE school_id = $1", [schoolId]],
            parents: ["SELECT COUNT(*)::integer AS total FROM parents WHERE school_id = $1", [schoolId]],
            classes: ["SELECT COUNT(*)::integer AS total FROM classes WHERE school_id = $1", [schoolId]],
            session: ["SELECT id, session_name FROM academic_sessions WHERE is_current = TRUE AND school_id = $1 ORDER BY id DESC LIMIT 1", [schoolId]],
            term: ["SELECT id, term_name FROM terms WHERE is_current = TRUE AND school_id = $1 ORDER BY id DESC LIMIT 1", [schoolId]],
            gender: ["SELECT gender, COUNT(*) AS total FROM students WHERE school_id = $1 GROUP BY gender ORDER BY gender", [schoolId]],
            class_population: ["SELECT c.class_name, COUNT(se.student_id) AS total_students FROM classes c LEFT JOIN student_enrollments se ON se.class_id = c.id AND se.enrollment_status = 'Active' WHERE c.school_id = $1 GROUP BY c.id, c.class_name ORDER BY c.class_name", [schoolId]],
            recent_students: ["SELECT id, surname, first_name, middle_name, admission_number, created_at FROM students WHERE school_id = $1 ORDER BY created_at DESC LIMIT $2", [schoolId, 5]],
            today_attendance: ["SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE a.status = 'PRESENT') AS present, COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent, COUNT(*) FILTER (WHERE a.status = 'LATE') AS late FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.attendance_date = CURRENT_DATE AND s.school_id = $1", [schoolId]],
            top_students: ["SELECT s.id, s.surname, s.first_name, AVG(r.total_score) AS average_score FROM students s JOIN student_results r ON r.student_id = s.id WHERE s.school_id = $1 GROUP BY s.id, s.surname, s.first_name ORDER BY average_score DESC LIMIT $2", [schoolId, 10]],
            expected_fees: ["SELECT COALESCE(SUM(fs.amount), 0) AS total FROM student_enrollments se JOIN students s ON s.id = se.student_id JOIN fee_structures fs ON fs.session_id = se.session_id AND fs.term_id = $3 AND fs.class_id = se.class_id WHERE se.session_id = $2 AND se.enrollment_status = 'Active' AND s.school_id = $1", [schoolId, 3, 4]],
            total_payments: ["SELECT COALESCE(SUM(sp.amount_paid), 0) AS total FROM student_payments sp JOIN students s ON s.id = sp.student_id WHERE sp.session_id = $2 AND sp.term_id = $3 AND s.school_id = $1", [schoolId, 3, 4]],
            students_with_payments: ["SELECT COUNT(DISTINCT sp.student_id) AS total FROM student_payments sp JOIN students s ON s.id = sp.student_id WHERE sp.session_id = $2 AND sp.term_id = $3 AND s.school_id = $1", [schoolId, 3, 4]],
            recent_payments: ["SELECT sp.id, sp.payment_date, sp.amount_paid, sp.payment_method, sp.reference_number, sp.remarks, CONCAT(s.surname, ' ', s.first_name) AS student_name FROM student_payments sp JOIN students s ON s.id = sp.student_id WHERE s.school_id = $1 ORDER BY sp.payment_date DESC, sp.id DESC LIMIT $2", [schoolId, 5]],
            announcements: ["SELECT * FROM announcements WHERE school_id = $1 ORDER BY created_at DESC LIMIT $2", [schoolId, 5]],
            expense_summary: ["SELECT COUNT(*)::INTEGER AS transaction_count, COALESCE(SUM(amount), 0) AS total_amount, COALESCE(AVG(amount), 0) AS average_amount, COALESCE(MAX(amount), 0) AS highest_amount FROM expenses WHERE school_id = $1", [schoolId]],
            expense_users: ["SELECT u.id, u.username, u.school_id, u.admin_type, r.role_name, u.is_active FROM users u JOIN roles r ON r.id = u.role_id WHERE u.school_id = $1 ORDER BY u.id", [schoolId]]
        };
        for (const [name, [sql, values]] of Object.entries(queries)) await runCheck(checks, name, pool, sql, values);
        const failed = checks.filter((check) => !check.ok);
        return res.json({ success: failed.length === 0, schoolId, failedChecks: failed.map((check) => check.name), checks });
    } catch (error) {
        console.error(`School ${schoolId} diagnostics failed:`, error);
        return next(error);
    }
};

module.exports = { diagnostics };
