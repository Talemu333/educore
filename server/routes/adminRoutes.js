const express = require("express");

const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLE_NAMES = require("../config/roleNames");
const adminController = require("../controllers/adminController");

router.use(authenticate);

router.get("/", authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN), adminController.getAdmins);
router.post("/", authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN), adminController.createAdministrator);
router.patch("/:id/activate", authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN), adminController.activateAdministrator);
router.patch("/:id/deactivate", authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN), adminController.deactivateAdministrator);

module.exports = router;