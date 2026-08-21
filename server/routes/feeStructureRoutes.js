const express = require("express");

const router = express.Router();

const authenticate =
require("../middlewares/authenticate");

const authorize =
require("../middlewares/authorize");

const validate =
require("../middlewares/validate");

const feeStructureController =
require("../controllers/feeStructureController");

const feeStructureValidator =
require("../validators/feeStructureValidator");

const ROLES = require("../constants/roles");

router.post(

    "/",

    authenticate,

    authorize(

        ROLES.ADMIN

    ),

    validate(

        feeStructureValidator.createFeeStructureSchema

    ),

    feeStructureController.createFeeStructure

);

router.get(

    "/",

    authenticate,

    feeStructureController.getFeeStructures

);

router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMIN
    ),
    validate(
        feeStructureValidator.updateFeeStructureSchema
    ),
    feeStructureController.updateFeeStructure
);

module.exports = router;