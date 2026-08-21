import api from "./axios";

export const getRelationships = async () => {

    const response = await api.get("/relationships");

    return response.data.data;

};