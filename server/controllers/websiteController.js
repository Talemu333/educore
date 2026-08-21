const websiteService =
    require("../services/websiteService");

const asyncHandler =
    require("../middlewares/asyncHandler");


/*
=========================================
PUBLIC: GET PUBLISHED PAGES
=========================================
*/

const getPublishedPages =
    asyncHandler(
        async (req, res) => {

            const pages =
                await websiteService
                    .getPublishedPages();

            res.json({

                success: true,

                data: pages

            });

        }
    );


/*
=========================================
PUBLIC: GET PAGE BY SLUG
=========================================
*/

const getPage =
    asyncHandler(
        async (req, res) => {

            const page =
                await websiteService
                    .getPage(
                        req.params.slug
                    );

            res.json({

                success: true,

                data: page

            });

        }
    );


/*
=========================================
ADMIN: GET ALL PAGES
=========================================
*/

const getAllPages =
    asyncHandler(
        async (req, res) => {

            const pages =
                await websiteService
                    .getAllPages();

            res.json({

                success: true,

                data: pages

            });

        }
    );


/*
=========================================
ADMIN: UPDATE PAGE
=========================================
*/

const updatePage =
    asyncHandler(
        async (req, res) => {

            const page =
                await websiteService
                    .updatePage(
                        req.params.id,
                        req.body
                    );

            res.json({

                success: true,

                message:
                    "Website page updated successfully.",

                data: page

            });

        }
    );

    /*
=====================================
ADMIN: GET PAGE SECTIONS
=====================================
*/

const getPageSections =
    asyncHandler(
        async (req, res) => {

            const sections =
                await websiteService
                    .getSectionsByPageId(
                        req.params.pageId
                    );

            res.json({

                success: true,

                data: sections

            });

        }
    );


/*
=====================================
ADMIN: CREATE SECTION
=====================================
*/

const createSection =
    asyncHandler(
        async (req, res) => {

            const section =
                await websiteService
                    .createSection({

                        ...req.body,

                        page_id:
                            req.params.pageId

                    });

            res.status(201).json({

                success: true,

                message:
                    "Website section created successfully.",

                data: section

            });

        }
    );


/*
=====================================
ADMIN: UPDATE SECTION
=====================================
*/

const updateSection =
    asyncHandler(
        async (req, res) => {

            const section =
                await websiteService
                    .updateSection(

                        req.params.id,

                        req.body

                    );

            res.json({

                success: true,

                message:
                    "Website section updated successfully.",

                data: section

            });

        }
    );


/*
=====================================
ADMIN: DELETE SECTION
=====================================
*/

const deleteSection =
    asyncHandler(
        async (req, res) => {

            await websiteService
                .deleteSection(
                    req.params.id
                );

            res.json({

                success: true,

                message:
                    "Website section deleted successfully."

            });

        }
    );

    /*
=========================================
ADMIN: GET ALL NEWS
=========================================
*/

const getAllNews =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .getAllNews();

            res.json({

                success: true,

                data: news

            });

        }
    );


/*
=========================================
PUBLIC: GET PUBLISHED NEWS
=========================================
*/

const getPublishedNews =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .getPublishedNews();

            res.json({

                success: true,

                data: news

            });

        }
    );


/*
=========================================
PUBLIC: GET NEWS BY SLUG
=========================================
*/

const getNewsBySlug =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .getNewsBySlug(
                        req.params.slug
                    );

            if (!news) {

                return res.status(404).json({

                    success: false,

                    message:
                        "News article not found."

                });

            }

            res.json({

                success: true,

                data: news

            });

        }
    );


/*
=========================================
ADMIN: GET NEWS BY ID
=========================================
*/

const getNewsById =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .getNewsById(
                        req.params.id
                    );

            if (!news) {

                return res.status(404).json({

                    success: false,

                    message:
                        "News article not found."

                });

            }

            res.json({

                success: true,

                data: news

            });

        }
    );


/*
=========================================
ADMIN: CREATE NEWS
=========================================
*/

const createNews =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .createNews(
                        req.body
                    );

            res.status(201).json({

                success: true,

                message:
                    "News article created successfully.",

                data: news

            });

        }
    );


/*
=========================================
ADMIN: UPDATE NEWS
=========================================
*/

const updateNews =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .updateNews(
                        req.params.id,
                        req.body
                    );

            if (!news) {

                return res.status(404).json({

                    success: false,

                    message:
                        "News article not found."

                });

            }

            res.json({

                success: true,

                message:
                    "News article updated successfully.",

                data: news

            });

        }
    );


/*
=========================================
ADMIN: DELETE NEWS
=========================================
*/

const deleteNews =
    asyncHandler(
        async (req, res) => {

            const news =
                await websiteService
                    .deleteNews(
                        req.params.id
                    );

            if (!news) {

                return res.status(404).json({

                    success: false,

                    message:
                        "News article not found."

                });

            }

            res.json({

                success: true,

                message:
                    "News article deleted successfully."

            });

        }
    );

    /*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

const getAllEvents =
    asyncHandler(
        async (req, res) => {

            const events =
                await websiteService
                    .getAllEvents();

            res.json({

                success: true,

                data: events

            });

        }
    );


/*
=========================================
PUBLIC: GET PUBLISHED EVENTS
=========================================
*/

const getPublishedEvents =
    asyncHandler(
        async (req, res) => {

            const events =
                await websiteService
                    .getPublishedEvents();

            res.json({

                success: true,

                data: events

            });

        }
    );


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

const getEventBySlug =
    asyncHandler(
        async (req, res) => {

            const event =
                await websiteService
                    .getEventBySlug(
                        req.params.slug
                    );

            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }

            res.json({

                success: true,

                data: event

            });

        }
    );


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

const getEventById =
    asyncHandler(
        async (req, res) => {

            const event =
                await websiteService
                    .getEventById(
                        req.params.id
                    );

            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }

            res.json({

                success: true,

                data: event

            });

        }
    );


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

const createEvent =
    asyncHandler(
        async (req, res) => {

            const event =
                await websiteService
                    .createEvent(
                        req.body
                    );

            res.status(201).json({

                success: true,

                message:
                    "Event created successfully.",

                data: event

            });

        }
    );


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

const updateEvent =
    asyncHandler(
        async (req, res) => {

            const event =
                await websiteService
                    .updateEvent(
                        req.params.id,
                        req.body
                    );

            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }

            res.json({

                success: true,

                message:
                    "Event updated successfully.",

                data: event

            });

        }
    );


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

const deleteEvent =
    asyncHandler(
        async (req, res) => {

            const event =
                await websiteService
                    .deleteEvent(
                        req.params.id
                    );

            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }

            res.json({

                success: true,

                message:
                    "Event deleted successfully."

            });

        }
    );

    /*
=====================================
GALLERY: GET PUBLISHED ITEMS
=====================================
*/

const getPublishedGallery =
    asyncHandler(
        async (req, res) => {

            const gallery =
                await websiteService
                    .getPublishedGallery();

            res.json({

                success: true,

                data: gallery

            });

        }
    );


/*
=====================================
GALLERY: GET ALL ITEMS FOR ADMIN
=====================================
*/

const getAllGallery =
    asyncHandler(
        async (req, res) => {

            const gallery =
                await websiteService
                    .getAllGallery();

            res.json({

                success: true,

                data: gallery

            });

        }
    );


/*
=====================================
GALLERY: GET ONE ITEM
=====================================
*/

const getGalleryById =
    asyncHandler(
        async (req, res) => {

            const gallery =
                await websiteService
                    .getGalleryById(
                        req.params.id
                    );

            res.json({

                success: true,

                data: gallery

            });

        }
    );


/*
=====================================
GALLERY: CREATE ITEM
=====================================
*/

const createGallery =
    asyncHandler(
        async (req, res) => {

            const gallery =
                await websiteService
                    .createGallery(
                        req.body
                    );

            res.status(201).json({

                success: true,

                message:
                    "Gallery item created successfully.",

                data: gallery

            });

        }
    );


/*
=====================================
GALLERY: UPDATE ITEM
=====================================
*/

const updateGallery =
    asyncHandler(
        async (req, res) => {

            const gallery =
                await websiteService
                    .updateGallery(

                        req.params.id,

                        req.body

                    );

            res.json({

                success: true,

                message:
                    "Gallery item updated successfully.",

                data: gallery

            });

        }
    );


/*
=====================================
GALLERY: DELETE ITEM
=====================================
*/

const deleteGallery =
    asyncHandler(
        async (req, res) => {

            await websiteService
                .deleteGallery(
                    req.params.id
                );

            res.json({

                success: true,

                message:
                    "Gallery item deleted successfully."

            });

        }
    );


module.exports = {

    getPublishedPages,

    getPage,

    getAllPages,

    updatePage,

    getPageSections,

    createSection,

    updateSection,

    deleteSection,

    getAllNews,

    getPublishedNews,

    getNewsBySlug,

    getNewsById,

    createNews,

    updateNews,

    deleteNews,

    getPublishedGallery,

    getAllGallery,

    getGalleryById,

    createGallery,

    updateGallery,

    deleteGallery,

    getAllEvents,

    getPublishedEvents,

    getEventBySlug,

    getEventById,

    createEvent,

    updateEvent,

    deleteEvent,

};;