import api from "./axios";

export const adminResetPassword = async (userId) => {
    const response = await api.post(`/auth/admin-reset-password/${userId}`);
    return response.data;
};
