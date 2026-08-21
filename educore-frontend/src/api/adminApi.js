import api from "./axios";


/*
=========================================
GET ALL ADMINISTRATORS
=========================================
*/

export const getAdministrators = async () => {

    const response =
        await api.get(
            "/admins"
        );


    return response.data.data;

};


/*
=========================================
CREATE ADMINISTRATOR
=========================================
*/

export const createAdministrator = async (
    data
) => {

    const response =
        await api.post(
            "/admins",
            data
        );


    return response.data.data;

};


/*
=========================================
ACTIVATE ADMINISTRATOR
=========================================
*/

export const activateAdministrator = async (
    id
) => {

    const response =
        await api.patch(
            `/admins/${id}/activate`
        );


    return response.data.data;

};


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

export const deactivateAdministrator = async (
    id
) => {

    const response =
        await api.patch(
            `/admins/${id}/deactivate`
        );


    return response.data.data;

};