const ApiError = require("../utils/ApiError");
const withTransaction = require("../utils/transaction");
const paymentModel = require("../models/paymentModel");
const studentModel = require("../models/studentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const feeStructureModel = require("../models/feeStructureModel");
const notificationService = require("./notificationService");
const NOTIFICATION_TYPES = require("../constants/notificationTypes");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const validatePaymentContext = async (data, schoolId, receivedBy) => {
    requireSchool(schoolId);
    const student = await studentModel.getStudentById(data.student_id, schoolId);
    if (!student) throw new ApiError(404, "Student not found.");
    const session = await sessionModel.getSessionById(data.session_id, schoolId);
    if (!session) throw new ApiError(404, "Academic session not found.");
    const term = await termModel.getTermById(data.term_id, schoolId);
    if (!term) throw new ApiError(404, "Academic term not found.");
    if (Number(term.session_id) !== Number(data.session_id)) throw new ApiError(400, "Selected term does not belong to the selected academic session.");
    return student;
};

const createPayment = async (data, receivedBy, schoolId) => {
    const student = await validatePaymentContext(data, schoolId, receivedBy);
    const paymentAmount = Number(data.amount_paid);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) throw new ApiError(400, "Payment amount must be greater than zero.");

    const totalFees = await feeStructureModel.getTotalFeesForClass(data.session_id, data.term_id, student.class_id, schoolId);
    const totalPaid = await paymentModel.getTotalPaid(data.student_id, data.session_id, data.term_id, schoolId);
    const balance = totalFees - totalPaid;
    if (paymentAmount > balance) throw new ApiError(400, `Payment exceeds outstanding balance of ₦${balance}.`);

    return withTransaction(async (client) => {
        const payment = await paymentModel.createPayment({ ...data, amount_paid: paymentAmount, received_by: receivedBy }, schoolId, client);
        if (!payment) throw new ApiError(400, "Payment data does not belong to the authenticated school.");

        const year = new Date().getFullYear();
        const receiptNumber = `RCP-${year}-${String(payment.id).padStart(6, "0")}`;
        const updatedPayment = await paymentModel.updateReceiptNumber(payment.id, receiptNumber, schoolId, client);

        await notificationService.createNotification({
            user_id: receivedBy,
            title: "Payment Received",
            message: `Payment of ₦${payment.amount_paid} has been recorded successfully.`,
            type: NOTIFICATION_TYPES.PAYMENT
        }, client);
        return updatedPayment;
    });
};

const getStudentFinancialSummary = async (studentId, sessionId, termId, schoolId) => {
    const student = await studentModel.getStudentById(studentId, schoolId);
    if (!student) throw new ApiError(404, "Student not found.");
    const session = await sessionModel.getSessionById(sessionId, schoolId);
    if (!session) throw new ApiError(404, "Academic session not found.");
    const term = await termModel.getTermById(termId, schoolId);
    if (!term || Number(term.session_id) !== Number(sessionId)) throw new ApiError(404, "Academic term not found.");

    const totalFees = await feeStructureModel.getTotalFeesForClass(sessionId, termId, student.class_id, schoolId);
    const totalPaid = await paymentModel.getTotalPaid(studentId, sessionId, termId, schoolId);
    const balance = totalFees - totalPaid;
    const status = totalPaid === 0 ? "UNPAID" : balance === 0 ? "PAID" : "PARTLY PAID";
    return { student, totalFees, totalPaid, balance, status };
};

const getStudentPayments = async (studentId, sessionId, termId, schoolId) => {
    const student = await studentModel.getStudentById(studentId, schoolId);
    if (!student) throw new ApiError(404, "Student not found.");
    return paymentModel.getStudentPayments(studentId, sessionId, termId, schoolId);
};

const getDailyRevenue = async (date, schoolId) => {
    requireSchool(schoolId);
    return paymentModel.getDailyRevenue(date, schoolId);
};

const getReceipt = async (receiptNumber, schoolId) => {
    requireSchool(schoolId);
    const receipt = await paymentModel.getReceiptByNumber(receiptNumber, schoolId);
    if (!receipt) throw new ApiError(404, "Receipt not found.");
    return receipt;
};

const verifyReceipt = async (receiptNumber, schoolId) => {
    requireSchool(schoolId);
    const receipt = await paymentModel.getReceiptByNumber(receiptNumber, schoolId);
    return { valid: !!receipt, receipt };
};

const getPaymentReport = async (filters, schoolId) => {
    requireSchool(schoolId);
    return paymentModel.getPaymentReport(filters, schoolId);
};

const getPaymentReportSummary = async (filters, schoolId) => {
    requireSchool(schoolId);
    return paymentModel.getPaymentReportSummary(filters, schoolId);
};

module.exports = {
    createPayment,
    getStudentFinancialSummary,
    getStudentPayments,
    getDailyRevenue,
    getReceipt,
    verifyReceipt,
    getPaymentReport,
    getPaymentReportSummary
};