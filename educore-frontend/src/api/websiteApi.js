import api from "./axios";


/*
=========================================
GET ALL PUBLISHED PAGES
=========================================
*/

export const getPublishedPages = async () => {

    const response =
        await api.get(
            "/website/pages"
        );

    return response.data.data;

};


/*
=========================================
GET PAGE BY SLUG
=========================================
*/

export const getWebsitePage = async (
    slug
) => {

    const response =
        await api.get(
            `/website/pages/${slug}`
        );

    return response.data.data;

};

export const getAllWebsitePages = async () => {

    const response =
        await api.get(
            "/website/admin/pages"
        );

    return response.data.data;

};

export const updateWebsitePage = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/website/pages/${id}`,
            data
        );

    return response.data.data;

};

/*
=====================================
GET SECTIONS FOR PAGE
=====================================
*/

export const getPageSections = async (
    pageId
) => {

    const response =
        await api.get(
            `/website/admin/pages/${pageId}/sections`
        );

    return response.data.data;

};


/*
=====================================
CREATE WEBSITE SECTION
=====================================
*/

export const createWebsiteSection = async (
    pageId,
    data
) => {

    const response =
        await api.post(
            `/website/admin/pages/${pageId}/sections`,
            data
        );

    return response.data.data;

};


/*
=====================================
UPDATE WEBSITE SECTION
=====================================
*/

export const updateWebsiteSection = async (
    sectionId,
    data
) => {

    const response =
        await api.put(
            `/website/admin/sections/${sectionId}`,
            data
        );

    return response.data.data;

};


/*
=====================================
DELETE WEBSITE SECTION
=====================================
*/

export const deleteWebsiteSection = async (
    sectionId
) => {

    const response =
        await api.delete(
            `/website/admin/sections/${sectionId}`
        );

    return response.data;

};

/*
=====================================
NEWS
=====================================
*/

/*
=====================================
GET ALL NEWS — ADMIN
=====================================
*/

export const getNewsBySlug = async (slug) => {

    const response =
        await api.get(
            `/website/news/${slug}`
        );

    return response.data.data;

};

export const getAllNews = async () => {

    const response =
        await api.get(
            "/website/admin/news"
        );

    return response.data.data;

};


/*
=====================================
CREATE NEWS — ADMIN
=====================================
*/

export const createNews = async (
    data
) => {

    const response =
        await api.post(
            "/website/admin/news",
            data
        );

    return response.data.data;

};


/*
=====================================
UPDATE NEWS — ADMIN
=====================================
*/

export const updateNews = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/website/admin/news/${id}`,
            data
        );

    return response.data.data;

};


/*
=====================================
DELETE NEWS — ADMIN
=====================================
*/

export const deleteNews = async (
    id
) => {

    const response =
        await api.delete(
            `/website/admin/news/${id}`
        );

    return response.data;

};

export async function getPublishedNews() {

    const response = await api.get(
        "/website/news"
    );

    return response.data.data;

}

/*
=========================================
EVENTS
=========================================
*/


/*
=========================================
PUBLIC: GET PUBLISHED EVENTS
=========================================
*/

export const getPublishedEvents =
    async () => {

        const response =
            await api.get(
                "/website/events"
            );

        return response.data.data;

    };


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

export const getEventBySlug =
    async (
        slug
    ) => {

        const response =
            await api.get(
                `/website/events/${slug}`
            );

        return response.data.data;

    };


/*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

export const getAllEvents =
    async () => {

        const response =
            await api.get(
                "/website/admin/events"
            );

        return response.data.data;

    };


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

export const getEventById =
    async (
        id
    ) => {

        const response =
            await api.get(
                `/website/admin/events/${id}`
            );

        return response.data.data;

    };


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

export const createEvent =
    async (
        data
    ) => {

        const response =
            await api.post(
                "/website/admin/events",
                data
            );

        return response.data.data;

    };


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

export const updateEvent =
    async (
        id,
        data
    ) => {

        const response =
            await api.put(
                `/website/admin/events/${id}`,
                data
            );

        return response.data.data;

    };


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

export const deleteEvent =
    async (
        id
    ) => {

        const response =
            await api.delete(
                `/website/admin/events/${id}`
            );

        return response.data;

    };