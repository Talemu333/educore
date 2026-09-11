import api from "./axios";

export const registerPartner = async (data) => {
    const response = await api.post("/partners/register", data);
    return response.data;
};

export const loginPartner = async (data) => {
    const response = await api.post("/partners/login", data);
    return response.data;
};

export const logoutPartner = async () => {
    const response = await api.post("/partners/logout");
    return response.data;
};

export const getPartnerDashboard = async () => {
    const response = await api.get("/partners/dashboard");
    return response.data;
};

export const createPartnerLead = async (data) => {
    const response = await api.post("/partners/leads", data);
    return response.data;
};
