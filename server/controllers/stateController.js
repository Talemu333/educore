const asyncHandler = require("../middlewares/asyncHandler");

const stateService = require("../services/stateService");

const getStates = asyncHandler(async (req, res) => {

    const states = await stateService.getStates();

    res.json({

        success: true,

        data: states

    });

});

module.exports = {

    getStates

};