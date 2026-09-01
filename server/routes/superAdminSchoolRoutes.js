const express = require("express");
const authenticate = require("../middlewares/authenticate");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");
const controller = require("../controllers/superAdminSchoolController");

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get("/", controller.getSchools);
router.get("/:id", controller.getSchool);
router.post("/", controller.createSchool);
router.post("/:id/administrator", controller.createSchoolAdministrator);
router.put("/:id", controller.updateSchool);
router.patch("/:id/status", controller.setSchoolStatus);

module.exports = router;
