const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const schoolDatabaseContext = require("../middlewares/schoolDatabaseContext");
const ROLES = require("../constants/roles");
const armController = require("../controllers/armController");

router.get("/", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), armController.getArms);
router.get("/class/:classId", authenticate, schoolDatabaseContext, armController.getArmsByClass);
router.post("/", authenticate, schoolDatabaseContext, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), armController.createArm);

module.exports = router;
