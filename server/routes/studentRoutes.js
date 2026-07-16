const express = require("express");

const router = express.Router();

const studentController = require("../controllers/studentController");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const ROLES = require("../constants/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.createStudent
);

module.exports = router;