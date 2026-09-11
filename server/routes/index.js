const express = require("express");

const router = express.Router();

const generalRoutes = require("./generalRoutes");
const partnerRoutes = require("./partnerRoutes");
const partnerAdminRoutes = require("./partnerAdminRoutes");

router.use("/", generalRoutes);
router.use("/api/partners", partnerRoutes);
router.use("/api/partner-admin", partnerAdminRoutes);

module.exports = router;