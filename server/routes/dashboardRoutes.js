const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const ROLES = require("../constants/roles");

router.get(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN,

        ROLES.PRINCIPAL

    ),

    dashboardController.getDashboard

);

module.exports = router;