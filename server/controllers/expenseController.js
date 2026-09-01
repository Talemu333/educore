const asyncHandler = require("../middlewares/asyncHandler");
const expenseService = require("../services/expenseService");

const getSchoolId = (req) => req.user?.school_id;

const createExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(
        req.body,
        getSchoolId(req),
        req.user?.id
    );

    res.status(201).json({
        success: true,
        message: "Expense recorded successfully.",
        data: expense
    });
});

const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await expenseService.getExpenses(getSchoolId(req), {
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to,
        category: req.query.category,
        paymentMethod: req.query.payment_method,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
    });

    res.json({ success: true, data: expenses });
});

const getExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpense(
        req.params.id,
        getSchoolId(req)
    );

    res.json({ success: true, data: expense });
});

const updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(
        req.params.id,
        req.body,
        getSchoolId(req)
    );

    res.json({
        success: true,
        message: "Expense updated successfully.",
        data: expense
    });
});

const deleteExpense = asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id, getSchoolId(req));
    res.json({ success: true, message: "Expense deleted successfully." });
});

const getSummary = asyncHandler(async (req, res) => {
    const summary = await expenseService.getSummary(getSchoolId(req));
    res.json({ success: true, data: summary });
});

const getCategorySummary = asyncHandler(async (req, res) => {
    const summary = await expenseService.getCategorySummary(getSchoolId(req));
    res.json({ success: true, data: summary });
});

module.exports = {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    getCategorySummary
};
