import api from "./axios";

const publicSchoolParams = () => ({
    schoolSlug: window.location.pathname.split("/").filter(Boolean)[0] || ""
});

export const getSchoolSettings = async () => {
    const response = await api.get("/school-settings", {
        params: publicSchoolParams()
    });
    return response.data.data;
};

export const updateSchoolSettings = async (data) => {
    const response = await api.put("/school-settings", data);
    return response.data.data;
};
