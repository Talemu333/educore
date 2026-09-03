const ApiError = require("../utils/ApiError");
const expenseModel = require("../models/expenseModel");

const ALLOWED_ADMIN_TYPES = [
    "proprietor",
    "principal",
    "bursar"
];

const PAYMENT_METHODS = [
    "CASH",
    "BANK_TRANSFER",
    "CARD",
    "ONLINE"
];

const requireSchool = (schoolId) => {
    if (!schoolId) {
        throw new ApiError(403, "School context is required.");
    }
};

const requireFinanceAccess = (user) => {
    if (user?.role_name?.trim().toLowerCase() !== "admin") {
        throw new ApiError(403, "Access denied.");
    }

    const adminType = user?.admin_type?.trim().toLowerCase();

    if (!ALLOWED_ADMIN_TYPES.includes(adminType)) {
        throw new ApiError(403, "You do not have permission to manage expenses.");
    }
};

const normalizeExpense = (data = {}) => {
    const amount = Number(data.amount);

    if (!data.expense_date) {
        throw new ApiError(400, "Expense date is required.");
    }

    if (!data.category?.trim()) {
        throw new ApiError(400, "Expense category is required.");
    }

    if (!data.description?.trim()) {
        throw new ApiError(400, "Expense description is required.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new ApiError(400, "Expense amount must be greater than zero.");
    }

    const paymentMethod = String(data.payment_method || "CASH").trim().toUpperCase();

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        throw new ApiError(400, "Invalid expense payment method.");
    }

    return {
        expense_date: data.expense_date,
        category: data.category.trim(),
        description: data.description.trim(),
        amount,
        payment_method: paymentMethod,
        vendor: data.vendor?.trim() || null,
        reference_number: data.reference_number?.trim() || null,
        notes: data.notes?.trim() || null
    };
};

const createExpense = async (data, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);

    const expense = await expenseModel.createExpense(
        normalizeExpense(data),
        user.school_id,
        user.id
    );

    if (!expense) {
        throw new ApiError(400, "Expense could not be recorded for this school.");
    }

    return expense;
};

const getExpenses = async (filters, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);
    return expenseModel.getExpenses(filters, user.school_id);
};

const getExpense = async (expenseId, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);

    const expense = await expenseModel.getExpenseById(expenseId, user.school_id);

    if (!expense) {
        throw new ApiError(404, "Expense not found.");
    }

    return expense;
};

const updateExpense = async (expenseId, data, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);

    const expense = await expenseModel.updateExpense(
        expenseId,
        normalizeExpense(data),
        user.school_id
    );

    if (!expense) {
        throw new ApiError(404, "Expense not found.");
    }

    return expense;
};

const deleteExpense = async (expenseId, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);

    const expense = await expenseModel.deleteExpense(expenseId, user.school_id);

    if (!expense) {
        throw new ApiError(404, "Expense not found.");
    }

    return expense;
};

const getExpenseSummary = async (filters, user) => {
    requireSchool(user?.school_id);
    requireFinanceAccess(user);
    return expenseModel.getExpenseSummary(filters, user.school_id);
};

module.exports = {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary
};
