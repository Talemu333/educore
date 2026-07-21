const ApiError = require("../utils/ApiError");
const withTransaction = require("../utils/transaction");
const paymentModel = require("../models/paymentModel");
const studentModel = require("../models/studentModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");
const feeStructureModel = require("../models/feeStructureModel");
const notificationService = require("./notificationService");
const NOTIFICATION_TYPES = require("../constants/notificationTypes");

const createPayment = async (data) => {

    const student = await studentModel.getStudentById(
        data.student_id
    );

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }

    const session = await sessionModel.getSessionById(
        data.session_id
    );

    if (!session) {

        throw new ApiError(
            404,
            "Academic session not found."
        );

    }

    const term = await termModel.getTermById(data.term_id);

    if (!term) {

        throw new ApiError(
            404,
            "Academic term not found."
        );

    }

    const paymentAmount = Number(data.amount_paid);

    if (paymentAmount <= 0) {

        throw new ApiError(
            400,
            "Payment amount must be greater than zero."
        );

    }

    console.log("Student:", student);

    const totalFees = await feeStructureModel.getTotalFeesForClass(

        data.session_id,

        data.term_id,

        student.class_id

    );

    console.log("Total Fees:", totalFees);

    const totalPaid =
    await paymentModel.getTotalPaid(

        data.student_id,

        data.session_id,

        data.term_id

    );
    console.log("Total Paid:", totalPaid);
    const balance = totalFees - totalPaid;
    console.log("Balance:", balance);

    if (paymentAmount > balance) {

        throw new ApiError(
            400,
            `Payment exceeds outstanding balance of ₦${balance}.`
        );

    }

    return withTransaction(async (client) => {
        const payment = await paymentModel.createPayment(
            {
                ...data,
                amount_paid: paymentAmount
            },

            client

        );

        const year = new Date().getFullYear();
        const receiptNumber = `RCP-${year}-${String(payment.id).padStart(6,"0")}`;

        const updatedPayment = await paymentModel.updateReceiptNumber(

            payment.id,

            receiptNumber,

            client

        );

        await notificationService.createNotification(

            {

                user_id: data.received_by,

                title: "Payment Received",

                message:
                    `Payment of ₦${payment.amount_paid} has been recorded successfully.`,

                type: NOTIFICATION_TYPES.PAYMENT

            },

            client

        );

        return updatedPayment;



    });

};

const getStudentFinancialSummary = async (studentId,sessionId,termId) => {

    const student = await studentModel.getStudentById(studentId);

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }

    const totalFees = await feeStructureModel.getTotalFeesForClass(

        sessionId,

        termId,

        student.class_id

    );

    const totalPaid = await paymentModel.getTotalPaid(

        studentId,

        sessionId,

        termId

    );

    const balance = totalFees - totalPaid;

    let status;

    if (totalPaid === 0) {

        status = "UNPAID";

    }
    else if (balance === 0) {

        status = "PAID";

    }
    else {

        status = "PARTLY PAID";

    }

    return {

        student,

        totalFees,

        totalPaid,

        balance,

        status

    };

};

const getStudentPayments = async (

    studentId,

    sessionId,

    termId

) => {

    const student =
        await studentModel.getStudentById(studentId);

    if (!student) {

        throw new ApiError(
            404,
            "Student not found."
        );

    }

    return await paymentModel.getStudentPayments(

        studentId,

        sessionId,

        termId

    );

};

const getDailyRevenue = async (date) => {

    return await paymentModel.getDailyRevenue(date);

};

const getReceipt = async (receiptNumber) => {

    const receipt =
        await paymentModel.getReceiptByNumber(
            receiptNumber
        );

    if (!receipt) {

        throw new ApiError(
            404,
            "Receipt not found."
        );

    }

    return receipt;

};

const verifyReceipt = async (receiptNumber) => {

    const receipt =
        await paymentModel.getReceiptByNumber(
            receiptNumber
        );

    return {

        valid: !!receipt,

        receipt

    };

};

module.exports = {

    createPayment,
    getStudentFinancialSummary,
    getStudentPayments,
    getDailyRevenue,
    getReceipt,
    verifyReceipt

};