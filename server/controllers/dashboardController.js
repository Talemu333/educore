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

    // authenticate() already resolves and stores the dedicated school pool.
    // Reuse it when available instead of performing another registry lookup
    // from inside the school database context.
    const schoolPool = req.schoolDatabase || await getSchoolDatabase(schoolId);

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
