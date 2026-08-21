import api from "./axios";

export const createTeacherAssignment = async (data) => {

    const response = await api.post(

        "/teacher-assignments",

        data

    );

    return response.data.data;

};

export const getTeacherAssignments = async (teacherId) => {

    const response = await api.get(

        `/teacher-assignments/teacher/${teacherId}`

    );

    return response.data.data;

};

export const deleteTeacherAssignment = async (id) => {

    const response = await api.delete(

        `/teacher-assignments/${id}`

    );

    return response.data;

};

export const updateTeacherAssignment = async (id, data) => {

    const response = await api.put(

        `/teacher-assignments/${id}`,

        data

    );

    return response.data.data;

};

export const getMyAssignments = async () => {

    const response = await api.get(

        "/teacher-assignments/my-assignments"

    );

    return response.data.data;

};

export const getAllTeacherAssignments =
async () => {

    const response =
        await api.get(
            "/teacher-assignments"
        );

    return response.data.data;

};

export const getMyStudents = async () => {

    const response =
        await api.get(
            "/teacher-assignments/my-students"
        );

    return response.data.data;

};