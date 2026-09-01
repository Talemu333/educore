const express = require("express");
const router = express.Router();
const schoolSettingsController = require("../controllers/schoolSettingController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const ROLE_NAMES = require("../config/roleNames");

router.get("/", authenticate, schoolSettingsController.getSchoolSettings);

router.put(
    "/",
    authenticate,
    authorize(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
    schoolSettingsController.updateSchoolSettings
);

module.exports = router;