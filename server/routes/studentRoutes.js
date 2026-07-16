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
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getAllStudents
);
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.getStudentById
);
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    studentController.updateStudent
);
module.exports = router;