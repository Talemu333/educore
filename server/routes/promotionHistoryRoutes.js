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


const promotionHistoryController =
    require(
        "../controllers/promotionHistoryController"
    );


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
PROMOTION HISTORY
=========================================

Proprietor + Principal
=========================================
*/

router.get(

    "/",

    authorize(
        ROLE_NAMES.ADMIN
    ),

    promotionHistoryController
        .getPromotionHistory

);


module.exports = router;