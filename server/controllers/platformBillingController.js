const model = require("../models/platformBillingModel");

const overview = async (req, res, next) => {
    try { res.json({ success: true, data: await model.getOverview() }); }
    catch (error) { next(error); }
};

const createSubscription = async (req, res, next) => {
    try {
        const { school_id, plan_name, student_count, rate_per_student, amount_due, billing_period } = req.body || {};
        if (!Number.isInteger(Number(school_id)) || Number(school_id) < 1) return res.status(400).json({ success: false, message: "Select a valid school." });
        if (!String(plan_name || "").trim() || !String(billing_period || "").trim()) return res.status(400).json({ success: false, message: "Plan name and billing period are required." });
        if (!Number.isInteger(Number(student_count)) || Number(student_count) < 1) return res.status(400).json({ success: false, message: "Student count must be a positive whole number." });
        if (!Number.isFinite(Number(rate_per_student)) || Number(rate_per_student) < 0 || !Number.isFinite(Number(amount_due)) || Number(amount_due) < 0) return res.status(400).json({ success: false, message: "Rate and amount due must be valid non-negative amounts." });
        const result = await model.createSubscription({
            school_id: Number(school_id), plan_name: String(plan_name).trim(),
            student_count: Number(student_count), rate_per_student: Number(rate_per_student),
            amount_due: Number(amount_due), billing_period: String(billing_period).trim(),
            start_date: req.body.start_date, due_date: req.body.due_date,
            status: req.body.status, notes: req.body.notes
        }, req.user?.id);
        if (!result) return res.status(404).json({ success: false, message: "School not found." });
        res.status(201).json({ success: true, message: "School subscription recorded.", data: result });
    } catch (error) { next(error); }
};

const createPayment = async (req, res, next) => {
    try {
        const { subscription_id, amount, payment_method } = req.body || {};
        if (!Number.isInteger(Number(subscription_id)) || Number(subscription_id) < 1) return res.status(400).json({ success: false, message: "Select a subscription." });
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ success: false, message: "Payment amount must be greater than zero." });
        if (!["bank_transfer","cash","card","pos","other"].includes(payment_method)) return res.status(400).json({ success: false, message: "Select a valid payment method." });
        const result = await model.createPayment({
            subscription_id: Number(subscription_id), amount: Number(amount),
            payment_date: req.body.payment_date, payment_method,
            reference: String(req.body.reference || "").trim(), notes: String(req.body.notes || "").trim()
        }, req.user?.id);
        res.status(201).json({ success: true, message: "Payment recorded successfully.", data: result });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ success: false, message: error.message });
        next(error);
    }
};

module.exports = { overview, createSubscription, createPayment };