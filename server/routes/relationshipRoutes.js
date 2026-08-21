const express = require("express");

const router = express.Router();

const relationshipController = require("../controllers/relationshipController");

router.get(

    "/",

    relationshipController.getRelationships

);

module.exports = router;