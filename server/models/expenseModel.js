const pool = require("../config/database");

const getExpenses = async (schoolId, filters = {}) => {
    const values = [schoolId];
    const conditions = ["e.school_id = $1"];
    let index = 2;

    if (filters.dateFrom) {
        conditions.push(`e.expense_date >= $${index++}`);
        values.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        conditions.push(`e.expense_date <= $${index++}`);
        values.push(filters.dateTo);
    }

    if (filters.category) {
        conditions.push(`LOWER(e.category) = LOWER($${index++})`);
        values.push(filters.category);
    }

    if (filters.paymentMethod) {
        conditions.push(`LOWER(e.payment_method) = LOWER($${index++})`);
        values.push(filters.paymentMethod);
    }

    if (filters.search) {
        conditions.push(`(
            e.description ILIKE $${index}
            OR COALESCE(e.payee, '') ILIKE $${index}
            OR COALESCE(e.reference_number, '') ILIKE $${index}
        )`);
        values.push(`%${filters.search}%`);
        index += 1;
    }

    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = Math.max(Number(filters.offset) || 0, 0);

    values.push(limit, offset);

    const result = await pool.query(`
        SELECT
            e.id,
            e.school_id,
            e.expense_date,
            e.category,
            e.description,
            e.amount,
            e.payment_method,
            e.payee,
            e.reference_number,
            e.notes,
            e.recorded_by,
            COALESCE(NULLIF(TRIM(CONCAT(u.username)), ''), 'System') AS recorded_by_name,
            e.created_at,
            e.updated_at
        FROM expenses e
        LEFT JOIN users u
            ON u.id = e.recorded_by
           AND u.school_id = e.school_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.expense_date DESC, e.id DESC
        LIMIT $${index++} OFFSET $${index}
    `, values);

    return result.rows;
};

const getExpenseById = async (id, schoolId) => {
    const result = await pool.query(`
        SELECT
            e.id,
            e.school_id,
            e.expense_date,
            e.category,
            e.description,
            e.amount,
            e.payment_method,
            e.payee,
            e.reference_number,
            e.notes,
            e.recorded_by,
            COALESCE(NULLIF(TRIM(CONCAT(u.username)), ''), 'System') AS recorded_by_name,
            e.created_at,
            e.updated_at
        FROM expenses e
        LEFT JOIN users u
            ON u.id = e.recorded_by
           AND u.school_id = e.school_id
        WHERE e.id = $1 AND e.school_id = $2
    `, [id, schoolId]);

    return result.rows[0];
};

const createExpense = async (data, schoolId, userId) => {
    const result = await pool.query(`
        INSERT INTO expenses (
            school_id,
            expense_date,
            category,
            description,
            amount,
            payment_method,
            payee,
            reference_number,
            notes,
            recorded_by
        )
        SELECT
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        WHERE EXISTS (
            SELECT 1 FROM users
            WHERE id = $10 AND school_id = $1
        )
        RETURNING *;
    `, [
        schoolId,
        data.expense_date,
        data.category,
        data.description,
        data.amount,
        data.payment_method || null,
        data.payee || null,
        data.reference_number || null,
        data.notes || null,
        userId
    ]);

    return result.rows[0];
};

const updateExpense = async (id, data, schoolId) => {
    const result = await pool.query(`
        UPDATE expenses
        SET expense_date = $1,
            category = $2,
            description = $3,
            amount = $4,
            payment_method = $5,
            payee = $6,
            reference_number = $7,
            notes = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND school_id = $10
        RETURNING *;
    `, [
        data.expense_date,
        data.category,
        data.description,
        data.amount,
        data.payment_method || null,
        data.payee || null,
        data.reference_number || null,
        data.notes || null,
        id,
        schoolId
    ]);

    return result.rows[0];
};

const deleteExpense = async (id, schoolId) => {
    const result = await pool.query(`
        DELETE FROM expenses
        WHERE id = $1 AND school_id = $2
        RETURNING id;
    `, [id, schoolId]);

    return result.rows[0];
};

const getExpenseSummary = async (schoolId) => {
    const result = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(SUM(amount) FILTER (
                WHERE expense_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
            ), 0) AS monthly_amount,
            COALESCE(SUM(amount) FILTER (
                WHERE expense_date >= DATE_TRUNC('year', CURRENT_DATE)::DATE
            ), 0) AS yearly_amount
        FROM expenses
        WHERE school_id = $1;
    `, [schoolId]);

    return result.rows[0];
};

const getRecentExpenses = async (schoolId, limit = 5) => {
    const result = await pool.query(`
        SELECT
            e.id,
            e.expense_date,
            e.category,
            e.description,
            e.amount,
            e.payment_method,
            e.payee
        FROM expenses e
        WHERE e.school_id = $1
        ORDER BY e.expense_date DESC, e.id DESC
        LIMIT $2;
    `, [schoolId, limit]);

    return result.rows;
};

const getCategorySummary = async (schoolId) => {
    const result = await pool.query(`
        SELECT category, COUNT(*)::INTEGER AS count, COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE school_id = $1
        GROUP BY category
        ORDER BY total DESC, category;
    `, [schoolId]);

    return result.rows;
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getRecentExpenses,
    getCategorySummary
};
