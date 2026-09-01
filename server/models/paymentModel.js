const pool = require("../config/database");

const createPayment = async (data, schoolId, client = pool) => {
    const query = `
        INSERT INTO student_payments (
            student_id, session_id, term_id, amount_paid, payment_date,
            payment_method, reference_number, received_by, remarks, school_id
        )
        SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        WHERE EXISTS (
            SELECT 1 FROM students st WHERE st.id = $1 AND st.school_id = $10
        )
        AND EXISTS (
            SELECT 1 FROM academic_sessions ac WHERE ac.id = $2 AND ac.school_id = $10
        )
        AND EXISTS (
            SELECT 1 FROM terms tr
            WHERE tr.id = $3 AND tr.school_id = $10
              AND tr.session_id = $2
        )
        AND EXISTS (
            SELECT 1 FROM users u WHERE u.id = $8 AND u.school_id = $10
        )
        RETURNING *;
    `;
    const result = await client.query(query, [
        data.student_id, data.session_id, data.term_id, data.amount_paid,
        data.payment_date, data.payment_method, data.reference_number,
        data.received_by, data.remarks, schoolId
    ]);
    return result.rows[0];
};

const getStudentPayments = async (studentId, sessionId, termId, schoolId) => {
    const result = await pool.query(`
        SELECT sp.id, sp.payment_date, sp.amount_paid, sp.payment_method,
               sp.reference_number, sp.remarks, u.username AS received_by
        FROM student_payments sp
        INNER JOIN students st ON st.id = sp.student_id AND st.school_id = $4
        LEFT JOIN users u ON sp.received_by = u.id AND u.school_id = $4
        INNER JOIN academic_sessions ac ON ac.id = sp.session_id AND ac.school_id = $4
        INNER JOIN terms tr ON tr.id = sp.term_id AND tr.school_id = $4
        WHERE sp.student_id = $1 AND sp.session_id = $2 AND sp.term_id = $3
          AND sp.school_id = $4
        ORDER BY sp.payment_date ASC, sp.id ASC;
    `, [studentId, sessionId, termId, schoolId]);
    return result.rows;
};

const getTotalPaid = async (studentId, sessionId, termId, schoolId) => {
    const result = await pool.query(`
        SELECT COALESCE(SUM(sp.amount_paid), 0) AS total_paid
        FROM student_payments sp
        INNER JOIN students st ON st.id = sp.student_id AND st.school_id = $4
        INNER JOIN academic_sessions ac ON ac.id = sp.session_id AND ac.school_id = $4
        INNER JOIN terms tr ON tr.id = sp.term_id AND tr.school_id = $4
        WHERE sp.student_id = $1 AND sp.session_id = $2 AND sp.term_id = $3
          AND sp.school_id = $4;
    `, [studentId, sessionId, termId, schoolId]);
    return Number(result.rows[0].total_paid);
};

const updateReceiptNumber = async (paymentId, receiptNumber, schoolId, client = pool) => {
    const result = await client.query(`
        UPDATE student_payments sp SET reference_number = $2
        FROM students st
        WHERE sp.id = $1 AND sp.student_id = st.id AND st.school_id = $3
          AND sp.school_id = $3
        RETURNING sp.*;
    `, [paymentId, receiptNumber, schoolId]);
    return result.rows[0];
};

const getDailyRevenue = async (date, schoolId) => {
    const result = await pool.query(`
        SELECT COALESCE(SUM(sp.amount_paid), 0) AS total
        FROM student_payments sp
        INNER JOIN students st ON st.id = sp.student_id
        WHERE sp.payment_date = $1 AND st.school_id = $2
          AND sp.school_id = $2;
    `, [date, schoolId]);
    return Number(result.rows[0].total);
};

const getReceiptByNumber = async (receiptNumber, schoolId) => {
    const result = await pool.query(`
        SELECT sp.reference_number, sp.payment_date, sp.amount_paid,
               sp.payment_method, sp.remarks, st.admission_number,
               st.first_name, st.surname, c.class_name, t.term_name,
               s.session_name, u.username AS received_by
        FROM student_payments sp
        JOIN students st ON sp.student_id = st.id AND st.school_id = $2
        JOIN classes c ON st.class_id = c.id AND c.school_id = $2
        JOIN terms t ON sp.term_id = t.id AND t.school_id = $2
        JOIN academic_sessions s ON sp.session_id = s.id AND s.school_id = $2
        LEFT JOIN users u ON sp.received_by = u.id AND u.school_id = $2
        WHERE sp.reference_number = $1 AND sp.school_id = $2;
    `, [receiptNumber, schoolId]);
    return result.rows[0];
};

const buildReport = (filters = {}, schoolId) => {
    const { sessionId, termId, classId, paymentMethod, dateFrom, dateTo, search } = filters;
    const conditions = ["st.school_id = $1", "sp.school_id = $1"];
    const values = [schoolId];
    let i = 2;
    const add = (condition, value) => { conditions.push(condition.replace("$X", `$${i}`)); values.push(value); i++; };
    if (sessionId) add("sp.session_id = $X", sessionId);
    if (termId) add("sp.term_id = $X", termId);
    if (classId) add("st.class_id = $X", classId);
    if (paymentMethod) add("sp.payment_method = $X", paymentMethod);
    if (dateFrom) add("sp.payment_date >= $X", dateFrom);
    if (dateTo) add("sp.payment_date <= $X", dateTo);
    if (search) {
        conditions.push(`(st.first_name ILIKE $${i} OR st.surname ILIKE $${i} OR st.admission_number ILIKE $${i})`);
        values.push(`%${search}%`); i++;
    }
    return { whereClause: `WHERE ${conditions.join(" AND ")}`, values };
};

const getPaymentReport = async (filters = {}, schoolId) => {
    const { whereClause, values } = buildReport(filters, schoolId);
    const result = await pool.query(`
        SELECT sp.id, sp.payment_date, sp.amount_paid, sp.payment_method,
               sp.reference_number, sp.remarks, st.id AS student_id,
               st.admission_number, st.first_name, st.surname, c.class_name,
               t.term_name, s.session_name, u.username AS received_by
        FROM student_payments sp
        JOIN students st ON sp.student_id = st.id
        JOIN classes c ON st.class_id = c.id AND c.school_id = st.school_id
        JOIN terms t ON sp.term_id = t.id AND t.school_id = st.school_id
        JOIN academic_sessions s ON sp.session_id = s.id AND s.school_id = st.school_id
        LEFT JOIN users u ON sp.received_by = u.id AND u.school_id = st.school_id
        ${whereClause}
        ORDER BY sp.payment_date DESC, sp.id DESC;
    `, values);
    return result.rows;
};

const getPaymentReportSummary = async (filters = {}, schoolId) => {
    const { whereClause, values } = buildReport(filters, schoolId);
    const result = await pool.query(`
        SELECT COUNT(sp.id) AS transaction_count,
               COUNT(DISTINCT sp.student_id) AS student_count,
               COALESCE(SUM(sp.amount_paid),0) AS total_amount,
               COALESCE(SUM(CASE WHEN sp.payment_method='CASH' THEN sp.amount_paid ELSE 0 END),0) AS cash_amount,
               COALESCE(SUM(CASE WHEN sp.payment_method='BANK_TRANSFER' THEN sp.amount_paid ELSE 0 END),0) AS transfer_amount,
               COALESCE(SUM(CASE WHEN sp.payment_method='CARD' THEN sp.amount_paid ELSE 0 END),0) AS pos_amount,
               COALESCE(SUM(CASE WHEN sp.payment_method='ONLINE' THEN sp.amount_paid ELSE 0 END),0) AS online_amount
        FROM student_payments sp
        JOIN students st ON sp.student_id = st.id
        ${whereClause};
    `, values);
    return result.rows[0];
};

module.exports = {
    createPayment, getStudentPayments, getTotalPaid, updateReceiptNumber,
    getDailyRevenue, getReceiptByNumber, getPaymentReport, getPaymentReportSummary
};