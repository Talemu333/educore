const express = require("express");

const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const expenseController = require("../controllers/expenseController");

const allowedRoles = [
    ROLES.ADMIN,
    ROLES.BURSAR,
    ROLES.PRINCIPAL
];

router.get(
    "/summary",
    authenticate,
    authorize(...allowedRoles),
    expenseController.getSummary
);

router.get(
    "/categories/summary",
    authenticate,
    authorize(...allowedRoles),
    expenseController.getCategorySummary
);

router.get(
    "/",
    authenticate,
    authorize(...allowedRoles),
    expenseController.getExpenses
);

router.get(
    "/:id",
    authenticate,
    authorize(...allowedRoles),
    expenseController.getExpense
);

router.post(
    "/",
    authenticate,
    authorize(...allowedRoles),
    expenseController.createExpense
);

router.put(
    "/:id",
    authenticate,
    authorize(...allowedRoles),
    expenseController.updateExpense
);

router.delete(
    "/:id",
    authenticate,
    authorize(...allowedRoles),
    expenseController.deleteExpense
);

module.exports = router;
