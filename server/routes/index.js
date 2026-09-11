const express = require("express");

const router = express.Router();

const generalRoutes = require("./generalRoutes");
const partnerRoutes = require("./partnerRoutes");

router.use("/", generalRoutes);
router.use("/api/partners", partnerRoutes);

module.exports = router;
