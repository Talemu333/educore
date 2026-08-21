import api from "./axios";

export const createBulkResults = async (data) => {

    const response = await api.post(

        "/results/bulk",

        data

    );

    return response.data.data;

};