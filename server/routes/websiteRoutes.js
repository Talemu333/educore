const express = require("express");

const router =
    express.Router();

const websiteController =
    require("../controllers/websiteController");

const authenticate =
    require("../middlewares/authenticate");

const authorize =
    require("../middlewares/authorize");

const ROLES =
    require("../constants/roles");


/*
=========================================
PUBLIC ROUTES
=========================================
*/

router.get(
    "/pages",
    websiteController.getPublishedPages
);


router.get(
    "/pages/:slug",
    websiteController.getPage
);


/*
=========================================
ADMIN ROUTES
=========================================
*/

router.get(
    "/admin/pages",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.getAllPages
);


router.put(
    "/pages/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.updatePage
);

/*
=====================================
ADMIN: WEBSITE SECTIONS
=====================================
*/

router.get(
    "/admin/pages/:pageId/sections",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.getPageSections

);


router.post(
    "/admin/pages/:pageId/sections",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.createSection

);


router.put(
    "/admin/sections/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.updateSection

);


router.delete(
    "/admin/sections/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.deleteSection

);

/*
=========================================
PUBLIC: NEWS
=========================================
*/

// Get all published news
router.get(
    "/news",
    websiteController.getPublishedNews
);


// Get single published news by slug
router.get(
    "/news/:slug",
    websiteController.getNewsBySlug
);


/*
=========================================
ADMIN: NEWS
=========================================
*/

// Get all news
router.get(
    "/admin/news",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.getAllNews
);


// Create news
router.post(
    "/admin/news",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.createNews
);


// Update news
router.put(
    "/admin/news/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.updateNews
);


// Delete news
router.delete(
    "/admin/news/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.deleteNews
);


/*
=====================================
PUBLIC: GALLERY
=====================================
*/

router.get(
    "/gallery",
    websiteController.getPublishedGallery
);


/*
=====================================
ADMIN: GALLERY
=====================================
*/

router.get(
    "/admin/gallery",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.getAllGallery

);


router.get(
    "/admin/gallery/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.getGalleryById

);


router.post(
    "/admin/gallery",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.createGallery

);


router.put(
    "/admin/gallery/:id",

    authenticate,

    authorize(
        ROLES.ADMIN
    ),

    websiteController.updateGallery

);


router.delete(
    "/admin/gallery/:id",

    authenticate,
    authorize(ROLES.ADMIN),

    websiteController.deleteGallery

);

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

router.get(
    "/events",
    websiteController.getPublishedEvents
);


/*
=========================================
PUBLIC: GET EVENT BY SLUG
=========================================
*/

router.get(
    "/events/:slug",
    websiteController.getEventBySlug
);


/*
=========================================
ADMIN: GET ALL EVENTS
=========================================
*/

router.get(
    "/admin/events",
    authenticate,
    authorize(ROLES.ADMIN),
    websiteController.getAllEvents
);


/*
=========================================
ADMIN: GET EVENT BY ID
=========================================
*/

router.get(
    "/admin/events/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    websiteController.getEventById
);


/*
=========================================
ADMIN: CREATE EVENT
=========================================
*/

router.post(
    "/admin/events",
    authenticate,
    authorize(ROLES.ADMIN),
    websiteController.createEvent
);


/*
=========================================
ADMIN: UPDATE EVENT
=========================================
*/

router.put(
    "/admin/events/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    websiteController.updateEvent
);


/*
=========================================
ADMIN: DELETE EVENT
=========================================
*/

router.delete(
    "/admin/events/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    websiteController.deleteEvent
);


module.exports = router;