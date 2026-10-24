const database = require("../config/database");
const pool = database.centralPool;

const getOverview = async () => {
    const [schools, subscriptions, payments] = await Promise.all([
        pool.query(`
            SELECT ss.school_id, ss.school_name, ss.school_email, ss.is_active
            FROM school_settings ss
            ORDER BY ss.school_name
        `),
        pool.query(`
            SELECT sub.id, sub.school_id, ss.school_name, sub.plan_name, sub.student_count,
                   sub.rate_per_student, sub.amount_due, sub.billing_period, sub.start_date,
                   sub.due_date, sub.status, sub.notes, sub.created_at,
                   COALESCE(SUM(pay.amount), 0)::numeric(14,2) AS amount_paid,
                   GREATEST(sub.amount_due - COALESCE(SUM(pay.amount), 0), 0)::numeric(14,2) AS balance
            FROM platform_school_subscriptions sub
            JOIN school_settings ss ON ss.school_id = sub.school_id
            LEFT JOIN platform_school_payments pay ON pay.subscription_id = sub.id
            GROUP BY sub.id, ss.school_name
            ORDER BY sub.created_at DESC, sub.id DESC
        `),
        pool.query(`
            SELECT pay.id, pay.subscription_id, pay.school_id, ss.school_name,
                   sub.plan_name, sub.billing_period, pay.amount, pay.payment_date,
                   pay.payment_method, pay.reference, pay.notes, pay.created_at
            FROM platform_school_payments pay
            JOIN school_settings ss ON ss.school_id = pay.school_id
            JOIN platform_school_subscriptions sub ON sub.id = pay.subscription_id
            ORDER BY pay.payment_date DESC, pay.id DESC
            LIMIT 500
        `)
    ]);
    return { schools: schools.rows, subscriptions: subscriptions.rows, payments: payments.rows };
};

const createSubscription = async (data, userId) => {
    const result = await pool.query(`
        INSERT INTO platform_school_subscriptions
            (school_id, plan_name, student_count, rate_per_student, amount_due, billing_period,
             start_date, due_date, status, notes, created_by)
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        WHERE EXISTS (SELECT 1 FROM schools WHERE id = $1)
        RETURNING *
    `, [
        data.school_id, data.plan_name, data.student_count, data.rate_per_student,
        data.amount_due, data.billing_period, data.start_date || null, data.due_date || null,
        data.status || "pending", data.notes || null, userId || null
    ]);
    return result.rows[0] || null;
};

const createPayment = async (data, userId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const sub = await client.query(
            "SELECT id, school_id, amount_due FROM platform_school_subscriptions WHERE id = $1 FOR UPDATE",
            [data.subscription_id]
        );
        if (!sub.rows[0]) {
            const error = new Error("Subscription not found.");
            error.status = 404;
            throw error;
        }
        if (Number(data.amount) > Number(sub.rows[0].amount_due)) {
            const error = new Error("Payment cannot exceed the subscription amount due. Record separate payments up to the outstanding balance.");
            error.status = 400;
            throw error;
        }
        const existing = await client.query(
            "SELECT COALESCE(SUM(amount),0) AS paid FROM platform_school_payments WHERE subscription_id = $1",
            [data.subscription_id]
        );
        const balance = Number(sub.rows[0].amount_due) - Number(existing.rows[0].paid);
        if (Number(data.amount) > balance) {
            const error = new Error("Payment exceeds the outstanding balance for this subscription.");
            error.status = 400;
            throw error;
        }
        const inserted = await client.query(`
            INSERT INTO platform_school_payments
                (subscription_id, school_id, amount, payment_date, payment_method, reference, notes, recorded_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `, [
            data.subscription_id, sub.rows[0].school_id, data.amount,
            data.payment_date || new Date().toISOString().slice(0,10), data.payment_method,
            data.reference || null, data.notes || null, userId || null
        ]);
        const newPaid = Number(existing.rows[0].paid) + Number(data.amount);
        if (newPaid >= Number(sub.rows[0].amount_due)) {
            await client.query(
                "UPDATE platform_school_subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'pending'",
                [data.subscription_id]
            );
        }
        await client.query("COMMIT");
        return inserted.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { getOverview, createSubscription, createPayment };