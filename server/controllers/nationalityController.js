const asyncHandler = require("../middlewares/asyncHandler");

const nationalityService = require("../services/nationalityService");

const getNationalities = asyncHandler(async (req, res) => {

    const nationalities = await nationalityService.getNationalities();

    res.json({

        success: true,

        data: nationalities

    });

});

module.exports = {

    getNationalities

};