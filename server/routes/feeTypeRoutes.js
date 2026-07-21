const express = require("express");
const router = express.Router();
const feeTypeController = require("../controllers/feeTypeController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {createFeeTypeSchema,updateFeeTypeSchema} = require("../validators/feeTypeValidator");
const ROLES = require("../constants/roles");

router.post(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN

    ),

    validate(createFeeTypeSchema),

    feeTypeController.createFeeType

);
router.get(

    "/",

    authenticate,

    feeTypeController.getFeeTypes

);
router.put(

    "/:id",

    authenticate,

    authorize(

        ROLES.ADMIN

    ),

    validate(updateFeeTypeSchema),

    feeTypeController.updateFeeType

);
router.delete(

    "/:id",

    authenticate,

    authorize(

        ROLES.ADMIN

    ),

    feeTypeController.deleteFeeType

);
module.exports = router;
