const cbtPdfImportService = require("../services/cbtPdfImportService");
const model = require("../models/cbtQuestionBankModel");

const schoolId = (req) => req.user.school_id;
const sendError = (res, error) => res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to process PDF." });

exports.preview = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Please upload a PDF file." });
        const result = await cbtPdfImportService.parsePdf(req.file.buffer);
        return res.json({ success: true, data: result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.importQuestions = async (req, res) => {
    try {
        const { subject_id, class_id, questions } = req.body;
        if (!subject_id || !class_id) return res.status(400).json({ success: false, message: "Subject and class are required." });
        if (!Array.isArray(questions) || !questions.length) return res.status(400).json({ success: false, message: "Select at least one question to import." });
        if (questions.length > 500) return res.status(400).json({ success: false, message: "You can import a maximum of 500 questions at a time." });

        const normalized = questions.map((q) => ({
            subject_id: Number(subject_id),
            class_id: Number(class_id),
            question_text: String(q.question_text || "").trim(),
            image_url: String(q.image_url || "").trim(),
            marks: Number(q.marks || 1),
            explanation: String(q.explanation || "").trim(),
            is_active: q.is_active !== false,
            options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o, index) => ({
                option_text: String(o.option_text || "").trim(),
                option_image_url: String(o.option_image_url || "").trim(),
                option_order: index + 1,
                is_correct: Boolean(o.is_correct),
            })) : [],
        }));

        const invalid = normalized.findIndex((q) => !q.question_text || q.options.length !== 4 || q.options.some((o) => !o.option_text) || q.options.filter((o) => o.is_correct).length !== 1 || !Number.isFinite(q.marks) || q.marks <= 0);
        if (invalid >= 0) return res.status(400).json({ success: false, message: `Question ${invalid + 1} is invalid. Please review it before importing.` });

        const result = await model.bulkCreate(normalized, schoolId(req), req.user.id);
        return res.status(201).json({ success: true, message: `${result.length} question(s) imported into the question bank.`, data: result });
    } catch (error) {
        return sendError(res, error);
    }
};
