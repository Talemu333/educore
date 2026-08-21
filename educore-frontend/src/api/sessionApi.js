import api from "./axios";


export const getSessions = async () => {

    const response =
        await api.get("/sessions");

    return response.data.data;

};


export const getSession = async (id) => {

    const response =
        await api.get(`/sessions/${id}`);

    return response.data.data;

};


export const createSession = async (data) => {

    const response =
        await api.post(
            "/sessions",
            data
        );

    return response.data.data;

};


export const updateSession = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/sessions/${id}`,
            data
        );

    return response.data.data;

};


export const setCurrentSession = async (
    id
) => {

    const response =
        await api.patch(
            `/sessions/${id}/current`
        );

    return response.data.data;

};