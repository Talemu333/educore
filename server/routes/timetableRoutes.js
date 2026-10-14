const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createTimetableSchema } = require("../validators/timetableValidator");
const ROLES = require("../config/roles");

router.use(authenticate);

// Teachers may only read their own schedule. The server derives identity from
// the authenticated session; clients cannot pass another teacher's ID.
router.get("/my", authorize(ROLES.TEACHER), timetableController.getMyTimetable);

// Full-school timetable management remains restricted to administrators.
router.get("/", authorize(ROLES.ADMIN), timetableController.getTimetables);
router.post("/", authorize(ROLES.ADMIN), validate(createTimetableSchema), timetableController.createTimetable);
router.put("/:id", authorize(ROLES.ADMIN), validate(createTimetableSchema), timetableController.updateTimetable);
router.delete("/:id", authorize(ROLES.ADMIN), timetableController.deleteTimetable);

module.exports = router;
