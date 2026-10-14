const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createTimetableSchema } = require("../validators/timetableValidator");
const ROLES = require("../config/roles");

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get("/", timetableController.getTimetables);
router.post("/", validate(createTimetableSchema), timetableController.createTimetable);
router.put("/:id", validate(createTimetableSchema), timetableController.updateTimetable);
router.delete("/:id", timetableController.deleteTimetable);

module.exports = router;
