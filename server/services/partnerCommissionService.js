const createFirstPaymentCommission = async ({ schoolId, paymentId, paymentAmount, client }) => {
    const leadResult = await client.query(`
        SELECT l.id, l.partner_id, l.converted_at
        FROM eduprow_partner_leads l
        WHERE l.school_id = $1
          AND l.status = 'converted'
          AND l.converted_at IS NOT NULL
        ORDER BY l.converted_at ASC, l.id ASC
        LIMIT 1
    `, [schoolId]);

    const lead = leadResult.rows[0];
    if (!lead) return null;

    // A referred school earns only one first-payment commission. The unique lead
    // constraint is the final duplicate safeguard if two payment requests race.
    const existingCommission = await client.query(
        `SELECT id, payment_id
         FROM eduprow_partner_commissions
         WHERE lead_id = $1
         LIMIT 1`,
        [lead.id]
    );
    if (existingCommission.rows[0]) return null;

    // Confirm that this is the first payment recorded for the school after the
    // partner lead was converted. Payment IDs are monotonically assigned by the
    // database, so this remains reliable even when payment_date is entered manually.
    const paymentResult = await client.query(
        `SELECT sp.id, sp.school_id, sp.amount_paid
         FROM student_payments sp
         WHERE sp.id = $1
           AND sp.school_id = $2
           AND NOT EXISTS (
               SELECT 1
               FROM student_payments earlier
               WHERE earlier.school_id = $2
                 AND earlier.id < sp.id
                 AND earlier.id > 0
           )`,
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
    `, [lead.partner_id, lead.id, paymentId, amount]);

    return result.rows[0] || null;
};

module.exports = { createFirstPaymentCommission };
