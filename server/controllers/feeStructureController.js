const feeStructureService = require("../services/feeStructureService");
const asyncHandler = require("../middlewares/asyncHandler");

const createFeeStructure = asyncHandler(async (req, res) => {

    const feeStructure =
        await feeStructureService.createFeeStructure(req.body);

    res.status(201).json({

        success: true,

        message: "Fee structure created successfully.",

        data: feeStructure

    });

});

const getFeeStructures = asyncHandler(async (req, res) => {

    const feeStructures =
        await feeStructureService.getFeeStructures();

    res.json({

        success: true,

        data: feeStructures

    });

});

module.exports = {

    createFeeStructure,

    getFeeStructures

};