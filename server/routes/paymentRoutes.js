const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const validate = require("../middlewares/validate");
const {createPaymentSchema} = require("../validators/paymentValidator");
const ROLES = require("../constants/roles");

const financeAdmin = authorizeAdminType("proprietor", "bursar");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    validate(createPaymentSchema),
    paymentController.createPayment
);

router.get(
    "/summary/:studentId/:sessionId/:termId",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.getStudentFinancialSummary
);

router.get(
    "/student/:studentId/:sessionId/:termId",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.getStudentPayments
);

router.get(
    "/reports/daily",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.getDailyRevenue
);

router.get(
    "/reports",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.getPaymentReport
);

router.get(
    "/receipt/:receiptNumber",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.getReceipt
);

router.get(
    "/receipt/verify/:receiptNumber",
    authenticate,
    authorize(ROLES.ADMIN),
    financeAdmin,
    paymentController.verifyReceipt
);

module.exports = router;
