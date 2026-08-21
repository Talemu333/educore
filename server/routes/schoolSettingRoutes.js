
// router.get(

//     "/",

//     authenticate,

//     schoolSettingController
//         .getSchoolSettings

// );


const express = require(
    "express"
);

const router = express.Router();


const schoolSettingsController = require(
    "../controllers/schoolSettingController"
);


const authenticate = require(
    "../middlewares/authenticate"
);


const authorize = require(
    "../middlewares/authorize"
);


const ROLE_NAMES = require(
    "../config/roleNames"
);


/*
=====================================
GET SCHOOL SETTINGS

All authenticated users can read
settings such as school name and
branding.
=====================================
*/

router.get(

    "/",

    schoolSettingsController
        .getSchoolSettings

);


/*
=====================================
UPDATE SCHOOL SETTINGS

Only the administrator can change
school-wide settings.
=====================================
*/

router.put(

    "/",

    authenticate,

    authorize(
        ROLE_NAMES.ADMIN
    ),

    schoolSettingsController
        .updateSchoolSettings

);


module.exports = router;