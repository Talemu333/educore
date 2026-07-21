const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createPromotionSchema} = require("../validators/promotionValidator");
const ROLES = require("../config/roles");

router.post(

    "/",

    authenticate,

    authorize(ROLES.ADMIN),

    validate(createPromotionSchema),

    promotionController.promoteStudents

);

module.exports = router;