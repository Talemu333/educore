const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const sessionController = require("../controllers/sessionController");

router.get(
    "/",
    authenticate,
    sessionController.getSessions
);

module.exports = router;