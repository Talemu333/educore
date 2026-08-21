const express =
    require("express");

const router =
    express.Router();


const authenticate =
    require("../middlewares/authenticate");

const authorize =
    require("../middlewares/authorize");

const ROLE_NAMES =
    require("../config/roleNames");

const adminController =
    require("../controllers/adminController");


/*
=========================================
AUTHENTICATION
=========================================
*/

router.use(
    authenticate
);


/*
=========================================
GET ADMINISTRATORS
=========================================
*/

router.get(

    "/",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    adminController.getAdmins

);


/*
=========================================
CREATE ADMINISTRATOR
=========================================
*/

router.post(

    "/",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    adminController.createAdministrator

);


/*
=========================================
ACTIVATE ADMINISTRATOR
=========================================
*/

router.patch(

    "/:id/activate",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    adminController.activateAdministrator

);


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

router.patch(

    "/:id/deactivate",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    adminController.deactivateAdministrator

);


module.exports = router;