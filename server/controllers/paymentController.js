const paymentService = require("../services/paymentService");
const asyncHandler = require("../middlewares/asyncHandler");

const getStudentFinancialSummary = asyncHandler(

    async (req, res) => {

        const summary =
            await paymentService.getStudentFinancialSummary(

                req.params.studentId,

                req.params.sessionId,

                req.params.termId

            );

        res.json({

            success: true,

            data: summary

        });

    }

);

const getStudentPayments = asyncHandler(

    async (req, res) => {

        const payments =
            await paymentService.getStudentPayments(

                req.params.studentId,

                req.params.sessionId,

                req.params.termId

            );

        res.json({

            success: true,

            data: payments

        });

    }

);

const createPayment = asyncHandler(async (req, res) => {

    const payment =
        await paymentService.createPayment(
            req.body,
            req.user.id
        );

    res.status(201).json({

        success: true,

        message: "Payment recorded successfully.",

        data: payment

    });

});

const getDailyRevenue = asyncHandler(

    async (req, res) => {

        const total =
            await paymentService.getDailyRevenue(

                req.query.date

            );

        res.json({

            success: true,

            total

        });

    }

);

const getReceipt = asyncHandler(

    async (req, res) => {

        const receipt =
            await paymentService.getReceipt(
                req.params.receiptNumber
            );

        res.json({

            success: true,

            data: receipt

        });

    }

);

const verifyReceipt = asyncHandler(

    async (req, res) => {

        const result =
            await paymentService.verifyReceipt(

                req.params.receiptNumber

            );

        res.json(result);

    }

);

const getPaymentReport = asyncHandler(

    async (req, res) => {

        const report =
            await paymentService.getPaymentReport(
                req.query
            );

        const summary =
            await paymentService.getPaymentReportSummary(
                req.query
            );

        res.json({

            success: true,

            data: {

                report,

                summary

            }

        });

    }

);

module.exports = {
    getStudentFinancialSummary,
    getStudentPayments,
    createPayment,
    getDailyRevenue,
    getReceipt,
    verifyReceipt,
    getPaymentReport
}