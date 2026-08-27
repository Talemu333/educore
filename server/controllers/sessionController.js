const sessionService = require("../services/sessionService");

const getSessions = async (req, res, next) => {
    try {
        const sessions = await sessionService.getSessions(req.user.school_id);
        res.json({ success: true, data: sessions });
    } catch (err) {
        next(err);
    }
};

const getSessionById = async (req, res, next) => {
    try {
        const session = await sessionService.getSessionById(
            req.params.id,
            req.user.school_id
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Academic session not found."
            });
        }

        res.json({ success: true, data: session });
    } catch (err) {
        next(err);
    }
};

const createSession = async (req, res, next) => {
    try {
        const { session_name, start_date, end_date } = req.body;

        if (!session_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Session name, start date and end date are required."
            });
        }

        if (new Date(end_date) <= new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        const session = await sessionService.createSession(
            {
                session_name: session_name.trim(),
                start_date,
                end_date
            },
            req.user.school_id
        );

        res.status(201).json({
            success: true,
            message: "Academic session created successfully.",
            data: session
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "An academic session with this name already exists."
            });
        }
        next(err);
    }
};

const updateSession = async (req, res, next) => {
    try {
        const { session_name, start_date, end_date } = req.body;

        if (!session_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Session name, start date and end date are required."
            });
        }

        if (new Date(end_date) <= new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        const session = await sessionService.updateSession(
            req.params.id,
            {
                session_name: session_name.trim(),
                start_date,
                end_date
            },
            req.user.school_id
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Academic session not found."
            });
        }

        res.json({
            success: true,
            message: "Academic session updated successfully.",
            data: session
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "An academic session with this name already exists."
            });
        }
        next(err);
    }
};

const setCurrentSession = async (req, res, next) => {
    try {
        const sessionId = Number(req.params.id);

        if (!Number.isInteger(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid academic session ID."
            });
        }

        const session = await sessionService.setCurrentSession(
            sessionId,
            req.user.school_id
        );

        res.json({
            success: true,
            message: "Academic session set as current successfully.",
            data: session
        });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
};

module.exports = {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    setCurrentSession
};