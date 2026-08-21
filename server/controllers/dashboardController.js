const asyncHandler = require("../middlewares/asyncHandler");
const dashboardService = require("../services/dashboardService");

const getDashboard = asyncHandler(async (req, res) => {

    const dashboard = await dashboardService.getDashboard();

    res.status(200).json({

        success: true,

        data: dashboard

    });

});

module.exports = {

    getDashboard

};