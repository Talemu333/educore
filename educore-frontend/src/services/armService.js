import api from "../api/axios";

export const getArms = async () => {

    const response = await api.get("/arms");

    return response.data.data;

};

export const getArmsByClass = async (classId) => {

    const response = await api.get(

        `/arms/class/${classId}`

    );

    return response.data.data;

};