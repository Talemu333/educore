const timetableService = require("../services/timetableService");
const asyncHandler = require("../middlewares/asyncHandler");

const getTimetables = asyncHandler(async (req, res) => {
    const data = await timetableService.getTimetables(req.user?.school_id);
    res.json({ success: true, data });
});

const getMyTimetable = asyncHandler(async (req, res) => {
    const data = await timetableService.getMyTimetable(req.user?.id, req.user?.school_id);
    res.json({ success: true, data });
});

const createTimetable = asyncHandler(async (req, res) => {
    const timetable = await timetableService.createTimetable(req.body, req.user?.school_id);
    res.status(201).json({
        success: true,
        message: "Timetable entry created successfully.",
        data: timetable
    });
});

const updateTimetable = asyncHandler(async (req, res) => {
    const timetable = await timetableService.updateTimetable(req.params.id, req.body, req.user?.school_id);
    res.json({ success: true, message: "Timetable entry updated successfully.", data: timetable });
});

const deleteTimetable = asyncHandler(async (req, res) => {
    await timetableService.deleteTimetable(req.params.id, req.user?.school_id);
    res.json({ success: true, message: "Timetable entry deleted successfully." });
});

module.exports = { getTimetables, getMyTimetable, createTimetable, updateTimetable, deleteTimetable };
