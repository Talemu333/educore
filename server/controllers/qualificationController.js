const asyncHandler = require("../middlewares/asyncHandler");

const qualificationService = require("../services/qualificationService");

const getQualifications = asyncHandler(async (req, res) => {

    const qualifications = await qualificationService.getQualifications();

    res.json({

        success: true,

        data: qualifications

    });

});

module.exports = {

    getQualifications

};