import api from "../api/axios";

export const getClasses = async () => {

    const response = await api.get("/classes");

    return response.data.data;

};