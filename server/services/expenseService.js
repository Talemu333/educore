const ApiError = require("../utils/ApiError");
const expenseModel = require("../models/expenseModel");

const ALLOWED_PAYMENT_METHODS = [
    "Cash",
    "Bank Transfer",
    "POS",
    "Cheque",
    "Other"
];

const validateExpense = (data) => {
    if (!data?.expense_date) {
        throw new ApiError(400, "Expense date is required.");
    }

    if (!data?.category?.trim()) {
        throw new ApiError(400, "Expense category is required.");
    }

    if (!data?.description?.trim()) {
        throw new ApiError(400, "Expense description is required.");
    }

    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new ApiError(400, "Expense amount must be greater than zero.");
    }

    if (
        data.payment_method &&
        !ALLOWED_PAYMENT_METHODS.includes(data.payment_method)
    ) {
        throw new ApiError(400, "Invalid expense payment method.");
    }
};

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }
};

const createExpense = async (data, schoolId, userId) => {
    requireSchool(schoolId);
    validateExpense(data);

    const expense = await expenseModel.createExpense({
        ...data,
        amount: Number(data.amount),
        category: data.category.trim(),
        description: data.description.trim()
    }, schoolId, userId);

    if (!expense) {
        throw new ApiError(403, "The recording user does not belong to this school.");
    }

    return expense;
};

const getExpenses = async (schoolId, filters) => {
    requireSchool(schoolId);
    return expenseModel.getExpenses(schoolId, filters);
};

const getExpense = async (id, schoolId) => {
    requireSchool(schoolId);
    const expense = await expenseModel.getExpenseById(id, schoolId);
    if (!expense) throw new ApiError(404, "Expense not found.");
    return expense;
};

const updateExpense = async (id, data, schoolId) => {
    requireSchool(schoolId);
    validateExpense(data);

    const existing = await expenseModel.getExpenseById(id, schoolId);
    if (!existing) throw new ApiError(404, "Expense not found.");

    return expenseModel.updateExpense(id, {
        ...data,
        amount: Number(data.amount),
        category: data.category.trim(),
        description: data.description.trim()
    }, schoolId);
};

const deleteExpense = async (id, schoolId) => {
    requireSchool(schoolId);
    const existing = await expenseModel.getExpenseById(id, schoolId);
    if (!existing) throw new ApiError(404, "Expense not found.");

    await expenseModel.deleteExpense(id, schoolId);
};

const getSummary = async (schoolId) => {
    requireSchool(schoolId);
    return expenseModel.getExpenseSummary(schoolId);
};

const getRecentExpenses = async (schoolId, limit = 5) => {
    requireSchool(schoolId);
    return expenseModel.getRecentExpenses(schoolId, limit);
};

const getCategorySummary = async (schoolId) => {
    requireSchool(schoolId);
    return expenseModel.getCategorySummary(schoolId);
};

module.exports = {
    ALLOWED_PAYMENT_METHODS,
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    getRecentExpenses,
    getCategorySummary
};
