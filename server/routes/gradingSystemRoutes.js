const express =
    require("express");

const router =
    express.Router();

const gradingSystemController =
    require("../controllers/gradingSystemController");

const authenticate =
    require("../middlewares/authenticate");

const authorize =
    require("../middlewares/authorize");

const validate =
    require("../middlewares/validate");

const {

    gradingSystemSchema

} = require(
    "../validators/gradingSystemValidator"
);

const ROLES =
    require("../config/roles");


/*
=====================================
GET ALL GRADES
=====================================
*/

router.get(

    "/",

    authenticate,

    gradingSystemController
        .getAllGradingSystems

);


/*
=====================================
GET ONE GRADE
=====================================
*/

router.get(

    "/:id",

    authenticate,

    gradingSystemController
        .getGradingSystemById

);


/*
=====================================
CREATE GRADE
=====================================
*/

router.post(

    "/",

    authenticate,

    authorize(ROLES.ADMIN),

    validate(gradingSystemSchema),

    gradingSystemController
        .createGradingSystem

);


/*
=====================================
UPDATE GRADE
=====================================
*/

router.put(

    "/:id",

    authenticate,

    authorize(ROLES.ADMIN),

    validate(gradingSystemSchema),

    gradingSystemController
        .updateGradingSystem

);


/*
=====================================
DELETE GRADE
=====================================
*/

router.delete(

    "/:id",

    authenticate,

    authorize(ROLES.ADMIN),

    gradingSystemController
        .deleteGradingSystem

);


module.exports =
    router;