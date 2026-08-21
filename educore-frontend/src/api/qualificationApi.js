import api from "./axios";

export const getQualifications = async () => {

    const response = await api.get("/qualifications");

    return response.data.data;

};