const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const ROLE_NAMES = require("../config/roleNames");

const nationalityController = require("../controllers/nationalityController");

router.use(authenticate);

router.get(

    "/",

    authorize(

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.REGISTRAR,

        ROLE_NAMES.TEACHER

    ),

    nationalityController.getNationalities

);

module.exports = router;