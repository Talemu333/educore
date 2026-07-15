const express = require("express");

const router = express.Router();

const generalRoutes = require("./generalRoutes");

router.use("/", generalRoutes);

module.exports = router;