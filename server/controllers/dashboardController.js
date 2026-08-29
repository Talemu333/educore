const asyncHandler = require("../middlewares/asyncHandler");
const dashboardService = require("../services/dashboardService");

const getDashboard = asyncHandler(async (req, res) => {
    const schoolId = req.user?.school_id;

    if (!schoolId) {
        return res.status(403).json({
            success: false,
            message: "School context is required to load the dashboard."
        });
    }

    const dashboard = await dashboardService.getDashboard(schoolId);

    res.status(200).json({
        success: true,
        data: dashboard
    });
});

module.exports = { getDashboard };
