const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const ROLE_NAMES = require("../config/roleNames");

const qualificationController = require("../controllers/qualificationController");

router.use(authenticate);

router.get(

    "/",

    authorize(

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.REGISTRAR,

        ROLE_NAMES.TEACHER

    ),

    qualificationController.getQualifications

);

module.exports = router;