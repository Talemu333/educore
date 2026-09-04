const pool = require("../config/database");

const createExpense = async (data, schoolId, createdBy, client = pool) => {
    const result = await client.query(`
        INSERT INTO expenses (
            school_id, expense_date, category, description, amount,
            payment_method, vendor, reference_number, notes, created_by
        )
        SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        WHERE EXISTS (
            SELECT 1 FROM school_settings ss WHERE ss.id = $1
        )
        AND EXISTS (
            SELECT 1 FROM users u WHERE u.id = $10 AND u.school_id = $1
        )
        RETURNING *;
    `, [
        schoolId,
        data.expense_date,
        data.category,
        data.description,
        data.amount,
        data.payment_method,
        data.vendor || null,
        data.reference_number || null,
        data.notes || null,
        createdBy
    ]);

    return result.rows[0];
};

const getExpenses = async (filters = {}, schoolId) => {
    const {
        dateFrom = "",
        dateTo = "",
        category = "",
        paymentMethod = "",
        search = ""
    } = filters;

    const conditions = ["e.school_id = $1"];
    const values = [schoolId];
    let index = 2;

    const add = (condition, value) => {
        conditions.push(condition.replace("$X", `$${index}`));
        values.push(value);
        index += 1;
    };

    if (dateFrom) add("e.expense_date >= $X", dateFrom);
    if (dateTo) add("e.expense_date <= $X", dateTo);
    if (category) add("e.category = $X", category);
    if (paymentMethod) add("e.payment_method = $X", paymentMethod);
    if (search) {
        conditions.push(`(
            e.description ILIKE $${index}
            OR COALESCE(e.vendor, '') ILIKE $${index}
            OR COALESCE(e.reference_number, '') ILIKE $${index}
        )`);
        values.push(`%${search}%`);
        index += 1;
    }

    const result = await pool.query(`
        SELECT
            e.id,
            e.expense_date,
            e.category,
            e.description,
            e.amount,
            e.payment_method,
            e.vendor,
            e.reference_number,
            e.notes,
            e.created_at,
            e.updated_at,
            u.username AS created_by
        FROM expenses e
        LEFT JOIN users u
            ON u.id = e.created_by
            AND u.school_id = e.school_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.expense_date DESC, e.id DESC;
    `, values);

    return result.rows;
};

const getExpenseById = async (expenseId, schoolId) => {
    const result = await pool.query(`
        SELECT
            e.id,
            e.expense_date,
            e.category,
            e.description,
            e.amount,
            e.payment_method,
            e.vendor,
            e.reference_number,
            e.notes,
            e.created_at,
            e.updated_at,
            u.username AS created_by
        FROM expenses e
        LEFT JOIN users u
            ON u.id = e.created_by
            AND u.school_id = e.school_id
        WHERE e.id = $1
          AND e.school_id = $2;
    `, [expenseId, schoolId]);

    return result.rows[0];
};

const updateExpense = async (expenseId, data, schoolId) => {
    const result = await pool.query(`
        UPDATE expenses
        SET expense_date = $3,
            category = $4,
            description = $5,
            amount = $6,
            payment_method = $7,
            vendor = $8,
            reference_number = $9,
            notes = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND school_id = $2
        RETURNING *;
    `, [
        expenseId,
        schoolId,
        data.expense_date,
        data.category,
        data.description,
        data.amount,
        data.payment_method,
        data.vendor || null,
        data.reference_number || null,
        data.notes || null
    ]);

    return result.rows[0];
};

const deleteExpense = async (expenseId, schoolId) => {
    const result = await pool.query(`
        DELETE FROM expenses
        WHERE id = $1
          AND school_id = $2
        RETURNING id;
    `, [expenseId, schoolId]);

    return result.rows[0];
};

const getExpenseSummary = async (filters = {}, schoolId) => {
    const {
        dateFrom = "",
        dateTo = "",
        category = "",
        paymentMethod = ""
    } = filters;

    // The Expenses page summary must represent the same records shown in the
    // table. Academic-period filtering belongs to dashboard-specific summaries,
    // not to this general expenses summary endpoint.
    const conditions = ["school_id = $1"];
    const values = [schoolId];
    let index = 2;

    const add = (condition, value) => {
        conditions.push(condition.replace("$X", `$${index}`));
        values.push(value);
        index += 1;
    };

    if (dateFrom) add("expense_date >= $X", dateFrom);
    if (dateTo) add("expense_date <= $X", dateTo);
    if (category) add("category = $X", category);
    if (paymentMethod) add("payment_method = $X", paymentMethod);

    const result = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS transaction_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(AVG(amount), 0) AS average_amount,
            COALESCE(MAX(amount), 0) AS highest_amount
        FROM expenses
        WHERE ${conditions.join(" AND ")};
    `, values);

    return {
        ...result.rows[0],
        period: null,
        period_scope: dateFrom || dateTo ? "custom" : "all_time"
    };
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseSummary
};
