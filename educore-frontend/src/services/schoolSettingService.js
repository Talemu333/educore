import api from "@/api/axios";

export const getSchoolSettings = async () => {

    const response = await api.get(
        "/school-settings"
    );

    return response.data.data;

};