import api from "./axios";

export const getTeachers = async () => {

    const response = await api.get("/teachers");

    return response.data.data;

};

export const getTeacher = async (id) => {

    const response = await api.get(`/teachers/${id}`);

    return response.data.data;

};

export const createTeacher = async (teacherData) => {

    const response = await api.post(

        "/teachers",

        teacherData

    );

    return response.data;

};

export const updateTeacher = async (

    id,

    teacherData

) => {

    const response = await api.put(

        `/teachers/${id}`,

        teacherData

    );

    return response.data;

};

export const deactivateTeacher = async (id) => {

    const response = await api.delete(

        `/teachers/${id}`

    );

    return response.data;

};

export const getTeacherById = async (id) => {

    const response = await api.get(`/teachers/${id}`);

    return response.data.data;

};