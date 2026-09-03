const asyncHandler = require("../middlewares/asyncHandler");
const expenseService = require("../services/expenseService");

const createExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(req.body, req.user);

    res.status(201).json({
        success: true,
        message: "Expense recorded successfully.",
        data: expense
    });
});

const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await expenseService.getExpenses(req.query, req.user);

    res.json({
        success: true,
        data: expenses
    });
});

const getExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpense(req.params.id, req.user);

    res.json({
        success: true,
        data: expense
    });
});

const updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(
        req.params.id,
        req.body,
        req.user
    );

    res.json({
        success: true,
        message: "Expense updated successfully.",
        data: expense
    });
});

const deleteExpense = asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id, req.user);

    res.json({
        success: true,
        message: "Expense deleted successfully."
    });
});

const getExpenseSummary = asyncHandler(async (req, res) => {
    const summary = await expenseService.getExpenseSummary(req.query, req.user);

    res.json({
        success: true,
        data: summary
    });
});

module.exports = {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary
};
