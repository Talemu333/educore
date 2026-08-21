import api from "@/api/axios";

export const getTerms = async () => {

    const response = await api.get(

        "/terms"

    );

    return response.data.data;

};