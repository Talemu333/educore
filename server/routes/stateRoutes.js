const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const stateController = require("../controllers/stateController");

router.get(
    "/",
    authenticate,
    stateController.getStates
);

module.exports = router;