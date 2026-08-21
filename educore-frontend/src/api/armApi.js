import api from "./axios";

export const getArms = async () => {

    const response = await api.get("/arms");

    return response.data.data;

};