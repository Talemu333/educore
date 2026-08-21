import api from "./axios";


export const getSchoolSettings = async () => {

    const response =
        await api.get("/school-settings");

    return response.data.data;

};


export const updateSchoolSettings = async (
    data
) => {

    const response =
        await api.put(
            "/school-settings",
            data
        );

    return response.data.data;

};