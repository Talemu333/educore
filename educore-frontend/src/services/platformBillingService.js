import api from "@/api/axios";

export const getPlatformBillingOverview = async () => {
    const response = await api.get("/platform-billing");
    return response.data;
};

export const createPlatformSubscription = async (payload) => {
    const response = await api.post("/platform-billing/subscriptions", payload);
    return response.data;
};

export const recordPlatformPayment = async (payload) => {
    const response = await api.post("/platform-billing/payments", payload);
    return response.data;
};