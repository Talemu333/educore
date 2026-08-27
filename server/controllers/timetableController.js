const timetableService = require("../services/timetableService");
const asyncHandler = require("../middlewares/asyncHandler");

const createTimetable = asyncHandler(async (req, res) => {
    const timetable = await timetableService.createTimetable(req.body, req.user?.school_id);
    res.status(201).json({
        success: true,
        message: "Timetable created successfully.",
        data: timetable
    });
});

module.exports={createTimetable};