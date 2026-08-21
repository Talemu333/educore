import api from "./axios";

export const getStudentParents = async (studentId) => {

    const response = await api.get(`/students/${studentId}/parents`);

    return response.data.data;

};

export const createParent = async (parentData) => {

    const response = await api.post("/parents", parentData);

    return response.data;

};

export const updateParent = async (id, parentData) => {

    const response = await api.put(

        `/parents/${id}`,

        parentData

    );

    return response.data;

};

export const unlinkParent = async (

    studentId,

    parentId

) => {

    const response = await api.delete(

        `/parents/students/${studentId}/${parentId}`

    );

    return response.data;

};

export const getParents = async () => {

    const response = await api.get("/parents");

    return response.data.data;

};

export const linkParent = async (data) => {

    const response = await api.post(

        "/parents/link",

        data

    );

    return response.data;

};

export const getParentDashboard = async () => {

    const response =
        await api.get(
            "/parents/dashboard"
        );

    return response.data.data;

};