import api from "./axios";


/*
=========================================
GET PUBLISHED GALLERY
=========================================
*/

export const getPublishedGallery = async () => {

    const response =
        await api.get(
            "/website/gallery"
        );

    return response.data.data;

};


/*
=========================================
ADMIN: GET ALL GALLERY
=========================================
*/

export const getAllGallery = async () => {

    const response =
        await api.get(
            "/website/admin/gallery"
        );

    return response.data.data;

};


/*
=========================================
ADMIN: GET GALLERY BY ID
=========================================
*/

export const getGalleryById = async (
    id
) => {

    const response =
        await api.get(
            `/website/admin/gallery/${id}`
        );

    return response.data.data;

};


/*
=========================================
ADMIN: CREATE GALLERY
=========================================
*/

export const createGallery = async (
    data
) => {

    const response =
        await api.post(
            "/website/admin/gallery",
            data
        );

    return response.data.data;

};


/*
=========================================
ADMIN: UPDATE GALLERY
=========================================
*/

export const updateGallery = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/website/admin/gallery/${id}`,
            data
        );

    return response.data.data;

};


/*
=========================================
ADMIN: DELETE GALLERY
=========================================
*/

export const deleteGallery = async (
    id
) => {

    const response =
        await api.delete(
            `/website/admin/gallery/${id}`
        );

    return response.data;

};