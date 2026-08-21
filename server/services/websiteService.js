const ApiError = require("../utils/ApiError");

const websiteModel =
    require("../models/websiteModel");


/*
=========================================
PUBLIC: GET ALL PUBLISHED PAGES
=========================================
*/

const getPublishedPages = async () => {

    return await websiteModel
        .getPublishedPages();

};


/*
=========================================
PUBLIC: GET COMPLETE PAGE
=========================================
*/

const getPage = async (slug) => {

    const page =
        await websiteModel
            .getCompletePage(slug);

    if (!page) {

        throw new ApiError(
            404,
            "Website page not found."
        );

    }

    return page;

};


/*
=========================================
ADMIN: GET ALL PAGES
=========================================
*/

const getAllPages = async () => {

    return await websiteModel
        .getAllPages();

};


/*
=========================================
ADMIN: UPDATE PAGE
=========================================
*/

const updatePage = async (
    pageId,
    data
) => {

    const page =
        await websiteModel
            .updatePage(
                pageId,
                data
            );


    if (!page) {

        throw new ApiError(
            404,
            "Website page not found."
        );

    }


    return page;

};

/*
=====================================
GET SECTIONS FOR PAGE
=====================================
*/

const getSectionsByPageId = async (
    pageId
) => {

    return await websiteModel
        .getSectionsByPageId(pageId);

};


/*
=====================================
CREATE WEBSITE SECTION
=====================================
*/

const createSection = async (
    data
) => {

    return await websiteModel
        .createSection(data);

};


/*
=====================================
UPDATE WEBSITE SECTION
=====================================
*/

const updateSection = async (
    sectionId,
    data
) => {

    const section =
        await websiteModel
            .updateSection(
                sectionId,
                data
            );

    if (!section) {

        throw new ApiError(
            404,
            "Website section not found."
        );

    }

    return section;

};


/*
=====================================
DELETE WEBSITE SECTION
=====================================
*/

const deleteSection = async (
    sectionId
) => {

    const section =
        await websiteModel
            .deleteSection(
                sectionId
            );

    if (!section) {

        throw new ApiError(
            404,
            "Website section not found."
        );

    }

    return section;

};

/*
=========================================
NEWS
=========================================
*/

/*
=========================================
PUBLIC: GET PUBLISHED NEWS
=========================================
*/

const getPublishedNews = async () => {

    return await websiteModel
        .getPublishedNews();

};


/*
=========================================
PUBLIC: GET NEWS BY SLUG
=========================================
*/

const getNewsBySlug = async (
    slug
) => {

    const news =
        await websiteModel
            .getNewsBySlug(slug);


    if (!news) {

        throw new ApiError(
            404,
            "News article not found."
        );

    }


    return news;

};


/*
=========================================
ADMIN: GET ALL NEWS
=========================================
*/

const getAllNews = async () => {

    return await websiteModel
        .getAllNews();

};


/*
=========================================
ADMIN: CREATE NEWS
=========================================
*/

const createNews = async (
    data
) => {

    if (!data.title?.trim()) {

        throw new ApiError(
            400,
            "News title is required."
        );

    }


    if (!data.slug?.trim()) {

        throw new ApiError(
            400,
            "News slug is required."
        );

    }


    if (!data.content?.trim()) {

        throw new ApiError(
            400,
            "News content is required."
        );

    }


    return await websiteModel
        .createNews(data);

};


/*
=========================================
ADMIN: UPDATE NEWS
=========================================
*/

const updateNews = async (
    newsId,
    data
) => {

    if (!data.title?.trim()) {

        throw new ApiError(
            400,
            "News title is required."
        );

    }


    if (!data.slug?.trim()) {

        throw new ApiError(
            400,
            "News slug is required."
        );

    }


    if (!data.content?.trim()) {

        throw new ApiError(
            400,
            "News content is required."
        );

    }


    const news =
        await websiteModel
            .updateNews(
                newsId,
                data
            );


    if (!news) {

        throw new ApiError(
            404,
            "News article not found."
        );

    }


    return news;

};


/*
=========================================
ADMIN: DELETE NEWS
=========================================
*/

const deleteNews = async (
    newsId
) => {

    const news =
        await websiteModel
            .deleteNews(
                newsId
            );


    if (!news) {

        throw new ApiError(
            404,
            "News article not found."
        );

    }


    return news;

};

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

const getPublishedEvents = async () => {

    return await websiteModel
        .getPublishedEvents();

};


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

const getEventBySlug = async (
    slug
) => {

    const event =
        await websiteModel
            .getEventBySlug(slug);


    if (!event) {

        throw new ApiError(
            404,
            "Event not found."
        );

    }


    return event;

};


/*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

const getAllEvents = async () => {

    return await websiteModel
        .getAllEvents();

};


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

const getEventById = async (
    id
) => {

    const event =
        await websiteModel
            .getEventById(id);


    if (!event) {

        throw new ApiError(
            404,
            "Event not found."
        );

    }


    return event;

};


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

const createEvent = async (
    data
) => {

    if (
        !data.title ||
        !data.title.trim()
    ) {

        throw new ApiError(
            400,
            "Event title is required."
        );

    }


    if (
        !data.slug ||
        !data.slug.trim()
    ) {

        throw new ApiError(
            400,
            "Event slug is required."
        );

    }


    if (!data.event_date) {

        throw new ApiError(
            400,
            "Event date is required."
        );

    }


    return await websiteModel
        .createEvent(data);

};


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

const updateEvent = async (
    eventId,
    data
) => {

    if (
        !data.title ||
        !data.title.trim()
    ) {

        throw new ApiError(
            400,
            "Event title is required."
        );

    }


    if (
        !data.slug ||
        !data.slug.trim()
    ) {

        throw new ApiError(
            400,
            "Event slug is required."
        );

    }


    if (!data.event_date) {

        throw new ApiError(
            400,
            "Event date is required."
        );

    }


    const event =
        await websiteModel
            .updateEvent(
                eventId,
                data
            );


    if (!event) {

        throw new ApiError(
            404,
            "Event not found."
        );

    }


    return event;

};


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

const deleteEvent = async (
    eventId
) => {

    const event =
        await websiteModel
            .deleteEvent(
                eventId
            );


    if (!event) {

        throw new ApiError(
            404,
            "Event not found."
        );

    }


    return event;

};

/*
=====================================
GALLERY: GET PUBLISHED ITEMS
=====================================
*/

const getPublishedGallery = async () => {

    return await websiteModel
        .getPublishedGallery();

};


/*
=====================================
GALLERY: GET ALL ITEMS FOR ADMIN
=====================================
*/

const getAllGallery = async () => {

    return await websiteModel
        .getAllGallery();

};


/*
=====================================
GALLERY: GET ONE ITEM
=====================================
*/

const getGalleryById = async (
    id
) => {

    const gallery =
        await websiteModel
            .getGalleryById(id);

    if (!gallery) {

        throw new ApiError(
            404,
            "Gallery item not found."
        );

    }

    return gallery;

};


/*
=====================================
GALLERY: CREATE ITEM
=====================================
*/

const createGallery = async (
    data
) => {

    if (
        !data.title ||
        !data.title.trim()
    ) {

        throw new ApiError(
            400,
            "Gallery title is required."
        );

    }


    if (
        !data.image_url ||
        !data.image_url.trim()
    ) {

        throw new ApiError(
            400,
            "Gallery image URL is required."
        );

    }


    return await websiteModel
        .createGallery(data);

};


/*
=====================================
GALLERY: UPDATE ITEM
=====================================
*/

const updateGallery = async (
    id,
    data
) => {

    if (
        !data.title ||
        !data.title.trim()
    ) {

        throw new ApiError(
            400,
            "Gallery title is required."
        );

    }


    if (
        !data.image_url ||
        !data.image_url.trim()
    ) {

        throw new ApiError(
            400,
            "Gallery image URL is required."
        );

    }


    const gallery =
        await websiteModel
            .updateGallery(
                id,
                data
            );


    if (!gallery) {

        throw new ApiError(
            404,
            "Gallery item not found."
        );

    }


    return gallery;

};


/*
=====================================
GALLERY: DELETE ITEM
=====================================
*/

const deleteGallery = async (
    id
) => {

    const gallery =
        await websiteModel
            .deleteGallery(id);


    if (!gallery) {

        throw new ApiError(
            404,
            "Gallery item not found."
        );

    }


    return gallery;

};


module.exports = {

    getPublishedPages,

    getPage,

    getAllPages,

    updatePage,

    getSectionsByPageId,

    createSection,

    updateSection,

    deleteSection,

    getPublishedNews,

    getNewsBySlug,

    getAllNews,

    createNews,

    updateNews,

    deleteNews,

    getPublishedGallery,
    getAllGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,

    getPublishedEvents,

    getEventBySlug,

    getAllEvents,

    getEventById,

    createEvent,

    updateEvent,

    deleteEvent,

};;