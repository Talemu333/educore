import api from "../api/axios";

export const getStates = async () => {

    const response = await api.get("/states");

    return response.data.data;

};