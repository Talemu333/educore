const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const termController = require("../controllers/termController");

router.get(
    "/",
    authenticate,
    termController.getTerms
);

router.post(
    "/",
    authenticate,
    termController.createTerm
);

module.exports = router;
