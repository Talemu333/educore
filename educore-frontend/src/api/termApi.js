import api from "./axios";

export const getTerms = async () => {

    const response = await api.get("/terms");

    return response.data.data;

};