import api from "../api/axios";

export const getSchools = async () => {
    const response = await api.get("/super-admin/schools");
    return response.data;
};

export const createSchool = async (payload) => {
    const response = await api.post("/super-admin/schools", payload);
    return response.data;
};

export const updateSchool = async (id, payload) => {
    const response = await api.put(`/super-admin/schools/${id}`, payload);
    return response.data;
};

export const setSchoolStatus = async (id, isActive) => {
    const response = await api.patch(`/super-admin/schools/${id}/status`, {
        is_active: isActive
    });
    return response.data;
};
