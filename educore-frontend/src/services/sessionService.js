import api from "../api/axios";


/*
=========================================
GET ALL SESSIONS
=========================================
*/

export const getSessions = async () => {

    const response =
        await api.get("/sessions");

    return response.data.data;

};


/*
=========================================
GET ONE SESSION
=========================================
*/

export const getSession = async (id) => {

    const response =
        await api.get(`/sessions/${id}`);

    return response.data.data;

};


/*
=========================================
CREATE SESSION
=========================================
*/

export const createSession = async (data) => {

    const response =
        await api.post(
            "/sessions",
            data
        );

    return response.data.data;

};


/*
=========================================
UPDATE SESSION
=========================================
*/

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