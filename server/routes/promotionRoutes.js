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


const promotionController =
    require("../controllers/promotionController");


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
PROMOTION SETUP
=========================================

Proprietor + Principal
=========================================
*/

router.get(

    "/setup",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    promotionController
        .getPromotionSetup

);


/*
=========================================
GET STUDENTS
=========================================
*/

router.get(

    "/students",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    promotionController
        .getStudentsForPromotion

);


/*
=========================================
GET ARMS
=========================================
*/

router.get(

    "/classes/:classId/arms",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    promotionController
        .getArmsByClass

);


/*
=========================================
PROMOTE
=========================================
*/

router.post(

    "/promote",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    promotionController.processStudentDecisions

);


module.exports = router;