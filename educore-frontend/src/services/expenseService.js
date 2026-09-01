import api from "../api/axios";

export const getExpenses = async (params = {}) => {
    const response = await api.get("/expenses", { params });
    return response.data.data;
};

export const getExpenseSummary = async () => {
    const response = await api.get("/expenses/summary");
    return response.data.data;
};

export const getExpenseCategorySummary = async () => {
    const response = await api.get("/expenses/categories/summary");
    return response.data.data;
};

export const createExpense = async (data) => {
    const response = await api.post("/expenses", data);
    return response.data.data;
};

export const updateExpense = async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};
