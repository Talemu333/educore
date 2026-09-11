const createFirstPaymentCommission = async ({ schoolId, paymentId, paymentAmount, client }) => {
    const leadResult = await client.query(`
        SELECT l.id, l.partner_id
        FROM eduprow_partner_leads l
        WHERE l.school_id = $1
          AND l.status = 'converted'
        ORDER BY l.updated_at DESC, l.id DESC
        LIMIT 1
    `, [schoolId]);

    if (!leadResult.rows[0]) return null;

    // A referred school earns only one first-payment commission. If a commission
    // already exists for the converted lead, do not create another one on later payments.
    const existingCommission = await client.query(
        `SELECT id, payment_id
         FROM eduprow_partner_commissions
         WHERE lead_id = $1
         LIMIT 1`,
        [leadResult.rows[0].id]
    );
    if (existingCommission.rows[0]) return null;

    // The payment must belong to the same school context. This keeps the
    // commission flow tenant-safe and prepares the service for per-school databases.
    const paymentResult = await client.query(
        `SELECT id, school_id, amount_paid
         FROM student_payments
         WHERE id = $1 AND school_id = $2`,
        [paymentId, schoolId]
    );
    if (!paymentResult.rows[0]) return null;

    const amountPaid = Number(paymentResult.rows[0].amount_paid);
    const configuredPaymentAmount = Number(paymentAmount);
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) return null;
    if (!Number.isFinite(configuredPaymentAmount) || configuredPaymentAmount <= 0) return null;

    const settingsResult = await client.query(
        `SELECT commission_type, commission_rate, commission_fixed_amount
         FROM eduprow_partner_settings
         WHERE id = 1`
    );
    const settings = settingsResult.rows[0];
    if (!settings) return null;

    const amount = settings.commission_type === 'fixed'
        ? Number(settings.commission_fixed_amount || 0)
        : Number((amountPaid * Number(settings.commission_rate || 0) / 100).toFixed(2));

    if (!Number.isFinite(amount) || amount <= 0) return null;

    const result = await client.query(`
        INSERT INTO eduprow_partner_commissions
            (partner_id, lead_id, payment_id, amount, status, eligible_at, notes)
        VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP,
                'Automatically generated from the referred school''s first recorded payment.')
        ON CONFLICT (lead_id) WHERE lead_id IS NOT NULL DO NOTHING
        RETURNING *
    `, [leadResult.rows[0].partner_id, leadResult.rows[0].id, paymentId, amount]);

    return result.rows[0] || null;
};

module.exports = { createFirstPaymentCommission };
