const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const authorizeAdminType = require("../middlewares/authorizeAdminType");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");
const controller = require("../controllers/academicProgrammeController");

const academicAdmin = authorizeAdminType("proprietor", "principal", "vice_principal");
router.use(authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN), academicAdmin);

router.get("/", controller.get);
router.post("/", controller.create);
router.get("/:id/subjects", controller.programmeSubjects);
router.put("/:id/subjects", controller.saveSubjects);
router.get("/students", controller.students);
router.post("/assign-students", controller.assign);

module.exports = router;
