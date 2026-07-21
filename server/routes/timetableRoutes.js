const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createTimetableSchema} = require("../validators/timetableValidator");
const ROLES = require("../config/roles");

router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    validate(createTimetableSchema),
    timetableController.createTimetable
);

module.exports = router;