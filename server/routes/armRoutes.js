const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLES = require("../constants/roles");
const armController = require("../controllers/armController");

router.get("/", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), armController.getArms);
router.get("/class/:classId", authenticate, armController.getArmsByClass);
router.post("/", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), armController.createArm);

module.exports = router;