const studentResultService = require("../services/studentResultService");
const asyncHandler = require("../middlewares/asyncHandler");

const createResult = asyncHandler(async (req, res) => {

    const result = await studentResultService.createResult(req.body);

    res.status(201).json({
        success: true,
        message: "Result created successfully.",
        data: result
    });

});

const createBulkResults = asyncHandler(async (req, res) => {

    await studentResultService.createBulkResults(req.body);

    res.status(201).json({
        success: true,
        message: "Results uploaded successfully."
    });

});

module.exports = {

    createResult,

    createBulkResults

};