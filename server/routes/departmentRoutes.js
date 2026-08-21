const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const ROLE_NAMES = require("../config/roleNames");

const departmentController = require("../controllers/departmentController");

router.use(authenticate);

router.get(

    "/",

    authorize(

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.TEACHER

    ),

    departmentController.getDepartments

);

module.exports = router;