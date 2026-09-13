const asyncHandler = require("../middlewares/asyncHandler");
const dashboardService = require("../services/dashboardService");
const { getSchoolDatabase } = require("../config/schoolDatabaseManager");
const { runWithSchoolDatabase } = require("../config/databaseContext");

const getDashboard = asyncHandler(async (req, res) => {
    const schoolId = Number(req.user?.school_id);

    if (!Number.isInteger(schoolId) || schoolId < 1) {
        return res.status(403).json({
            success: false,
            message: "School context is required to load the dashboard."
        });
    }

    // Resolve the database again at the controller boundary instead of relying
    // only on middleware context propagation. This is especially important for
    // super-admin school context and prevents dashboard queries from falling
    // back to the central database when the request context is lost.
    const schoolPool = await getSchoolDatabase(schoolId);

    const dashboard = await runWithSchoolDatabase(
        schoolPool,
        () => dashboardService.getDashboard(schoolId)
    );

    res.status(200).json({
        success: true,
        data: dashboard
    });
});

module.exports = { getDashboard };
