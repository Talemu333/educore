import api from "./axios";

export const getClassTeacherAssignments = async () => {
    const response = await api.get("/class-teacher-assignments");
    return response.data.data;
};

export const createClassTeacherAssignment = async (payload) => {
    const response = await api.post("/class-teacher-assignments", payload);
    return response.data.data;
};

export const deactivateClassTeacherAssignment = async (id) => {
    const response = await api.delete(`/class-teacher-assignments/${id}`);
    return response.data;
};
