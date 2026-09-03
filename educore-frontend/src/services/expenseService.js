import api from "../api/axios";

export const getExpenses = async (filters = {}) => {
    const response = await api.get("/expenses", {
        params: {
            date_from: filters.dateFrom || "",
            date_to: filters.dateTo || "",
            category: filters.category || "",
            payment_method: filters.paymentMethod || "",
            search: filters.search || ""
        }
    });

    return response.data.data;
};

export const getExpenseSummary = async (filters = {}) => {
    const response = await api.get("/expenses/summary", {
        params: {
            date_from: filters.dateFrom || "",
            date_to: filters.dateTo || "",
            category: filters.category || "",
            payment_method: filters.paymentMethod || ""
        }
    });

    return response.data.data;
};

export const getExpense = async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
};

export const createExpense = async (data) => {
    const response = await api.post("/expenses", data);
    return response.data.data;
};

export const updateExpense = async ({ id, data }) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};
