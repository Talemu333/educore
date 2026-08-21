import api from "../api/axios";

export const getNationalities = async () => {

    const response = await api.get("/nationalities");

    return response.data.data;

};