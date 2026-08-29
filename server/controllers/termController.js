const termService = require("../services/termService");

const getTerms = async (req, res, next) => {
    try {
        const terms = await termService.getTerms(req.user.school_id);

        res.json({
            success: true,
            data: terms
        });
    } catch (err) {
        next(err);
    }
};

const createTerm = async (req, res, next) => {
    try {
        const {
            session_id,
            term_name,
            start_date,
            end_date,
            is_current = false
        } = req.body;

        if (!session_id || !term_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Academic session, term name, start date and end date are required."
            });
        }

        if (!["First Term", "Second Term", "Third Term"].includes(term_name)) {
            return res.status(400).json({
                success: false,
                message: "Invalid term name."
            });
        }

        if (end_date <= start_date) {
            return res.status(400).json({
                success: false,
                message: "Term end date must be after start date."
            });
        }

        const term = await termService.createTerm(
            {
                session_id: Number(session_id),
                term_name: term_name.trim(),
                start_date,
                end_date,
                is_current: Boolean(is_current)
            },
            req.user.school_id
        );

        res.status(201).json({
            success: true,
            message: "Academic term created successfully.",
            data: term
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This term already exists for the selected academic session."
            });
        }

        if (err.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "Invalid academic term information."
            });
        }

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
    getTerms,
    createTerm
};
