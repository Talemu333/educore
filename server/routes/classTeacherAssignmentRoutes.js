const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const ROLES = require("../constants/roles");
const controller = require("../controllers/classTeacherAssignmentController");

const academicAdmin = authorizeAdminType("proprietor", "principal", "vice_principal");

router.use(authenticate);
router.get("/", authorize(ROLES.ADMIN), academicAdmin, controller.listAssignments);
router.post("/", authorize(ROLES.ADMIN), academicAdmin, controller.createAssignment);
router.delete("/:id", authorize(ROLES.ADMIN), academicAdmin, controller.deactivateAssignment);

module.exports = router;
