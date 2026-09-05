const reportModel = require("../models/cbtReportModel");
const ApiError = require("../utils/ApiError");

const schoolId = (req) => Number(req.user.school_id);
const sendError = (res, error) => res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to process CBT report request." });

const getAttempts = async (req, res) => {
    try {
        return res.json({ success: true, data: await reportModel.getAttemptsReport(schoolId(req), req.query) });
    } catch (error) { return sendError(res, error); }
};

const getAttempt = async (req, res) => {
    try {
        const data = await reportModel.getAttemptDetails(Number(req.params.id), schoolId(req));
        if (!data) return res.status(404).json({ success: false, message: "Attempt not found." });
        return res.json({ success: true, data });
    } catch (error) { return sendError(res, error); }
};

const getPerformance = async (req, res) => {
    try {
        const data = await reportModel.getExamPerformance(Number(req.params.examId), schoolId(req));
        if (!data) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, data });
    } catch (error) { return sendError(res, error); }
};

module.exports = { getAttempts, getAttempt, getPerformance };
