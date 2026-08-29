import api from "@/api/axios";

export const getTerms = async () => {
    const response = await api.get("/terms");
    return response.data.data;
};

export const createTerm = async (data) => {
    const response = await api.post("/terms", data);
    return response.data.data;
};
