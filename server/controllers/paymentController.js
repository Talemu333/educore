const paymentService = require("../services/paymentService");
const asyncHandler = require("../middlewares/asyncHandler");

const getSchoolId = (req) => req.user?.school_id;

const getStudentFinancialSummary = asyncHandler(async (req, res) => {
    const summary = await paymentService.getStudentFinancialSummary(
        req.params.studentId, req.params.sessionId, req.params.termId, getSchoolId(req)
    );
    res.json({ success: true, data: summary });
});

const getStudentPayments = asyncHandler(async (req, res) => {
    const payments = await paymentService.getStudentPayments(
        req.params.studentId, req.params.sessionId, req.params.termId, getSchoolId(req)
    );
    res.json({ success: true, data: payments });
});

const createPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.createPayment(req.body, req.user.id, getSchoolId(req));
    res.status(201).json({ success: true, message: "Payment recorded successfully.", data: payment });
});

const getDailyRevenue = asyncHandler(async (req, res) => {
    const total = await paymentService.getDailyRevenue(req.query.date, getSchoolId(req));
    res.json({ success: true, total });
});

const getReceipt = asyncHandler(async (req, res) => {
    const receipt = await paymentService.getReceipt(req.params.receiptNumber, getSchoolId(req));
    res.json({ success: true, data: receipt });
});

const verifyReceipt = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyReceipt(req.params.receiptNumber, getSchoolId(req));
    res.json(result);
});

const getPaymentReport = asyncHandler(async (req, res) => {
    const schoolId = getSchoolId(req);
    const report = await paymentService.getPaymentReport(req.query, schoolId);
    const summary = await paymentService.getPaymentReportSummary(req.query, schoolId);
    res.json({ success: true, data: { report, summary } });
});

module.exports = {
    getStudentFinancialSummary,
    getStudentPayments,
    createPayment,
    getDailyRevenue,
    getReceipt,
    verifyReceipt,
    getPaymentReport
};