const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const nationalityController = require("../controllers/nationalityController");

router.get(
    "/",
    authenticate,
    nationalityController.getNationalities
);

module.exports = router;