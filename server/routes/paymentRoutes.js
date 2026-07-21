const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createPaymentSchema} = require("../validators/paymentValidator");
const ROLES = require("../config/roles");

router.post(

    "/",

    authenticate,

    authorize(ROLES.ADMIN),

    validate(createPaymentSchema),

    paymentController.createPayment

);

router.get(
    "/summary/:studentId/:sessionId/:termId",
    authenticate,
    paymentController.getStudentFinancialSummary

);
router.get(

    "/student/:studentId/:sessionId/:termId",

    authenticate,

    paymentController.getStudentPayments

);

router.get(

    "/reports/daily",

    authenticate,

    authorize(

        ROLES.ADMIN

    ),

    paymentController.getDailyRevenue

);
router.get(

    "/receipt/:receiptNumber",

    authenticate,

    paymentController.getReceipt

);
router.get(

    "/receipt/verify/:receiptNumber",

    authenticate,

    paymentController.verifyReceipt

);

module.exports = router;