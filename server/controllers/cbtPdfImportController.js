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
            group_key: q.group_key ? String(q.group_key).slice(0,80) : "",
            group_title: String(q.group_title || "").trim(),
            group_material_type: String(q.group_material_type || "").trim().toLowerCase(),
            group_instructions: String(q.group_instructions || "").trim(),
            group_material_text: String(q.group_material_text || "").trim(),
            group_image_url: String(q.group_image_url || "").trim(),
            is_active: q.is_active !== false,
            options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o, index) => ({
                option_text: String(o.option_text || "").trim(),
                option_image_url: String(o.option_image_url || "").trim(),
                option_order: index + 1,
                is_correct: Boolean(o.is_correct),
            })) : [],
        }));

        const invalid = normalized.findIndex((q) => (!q.question_text && !q.image_url) || q.options.length !== 4 || q.options.some((o) => !o.option_text && !o.option_image_url) || q.options.filter((o) => o.is_correct).length !== 1 || !Number.isFinite(q.marks) || q.marks <= 0);
        if (invalid >= 0) return res.status(400).json({ success: false, message: `Question ${invalid + 1} is invalid. Please review it before importing.` });

        const result = await model.bulkCreate(normalized, schoolId(req), req.user.id);
        return res.status(201).json({ success: true, message: `${result.length} question(s) imported into the question bank.`, data: result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.importToExam = async (req, res) => {
    try {
        const examId = Number(req.params.examId);
        const { questions } = req.body;
        if (!Number.isInteger(examId) || examId < 1) return res.status(400).json({ success: false, message: "Choose a valid examination." });
        if (!Array.isArray(questions) || !questions.length) return res.status(400).json({ success: false, message: "No questions were supplied for import." });
        if (questions.length > 500) return res.status(400).json({ success: false, message: "You can import a maximum of 500 questions at a time." });
        const db = require("../config/database");
        const examResult = await db.query("SELECT id FROM cbt_exams WHERE id=$1 AND school_id=$2", [examId, schoolId(req)]);
        if (!examResult.rows[0]) return res.status(404).json({ success: false, message: "Examination not found." });
        const normalized = questions.map((q) => ({
            subject_id: Number(q.subject_id),
            question_text: String(q.question_text || "").trim(),
            image_url: String(q.image_url || "").trim(),
            marks: Number(q.marks || 1),
            explanation: String(q.explanation || "").trim(),
            group_key: q.group_key ? String(q.group_key).slice(0,80) : "",
            group_title: String(q.group_title || "").trim(),
            group_material_type: String(q.group_material_type || "").trim().toLowerCase(),
            group_instructions: String(q.group_instructions || "").trim(),
            group_material_text: String(q.group_material_text || "").trim(),
            group_image_url: String(q.group_image_url || "").trim(),
            options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o, index) => ({
                option_text: String(o.option_text || "").trim(),
                option_image_url: String(o.option_image_url || "").trim(),
                option_order: index + 1,
                is_correct: Boolean(o.is_correct),
            })) : [],
        }));
        const invalid = normalized.findIndex((q) => !Number.isInteger(q.subject_id) || q.subject_id < 1 || !q.question_text ||
            q.options.length !== 4 || q.options.some((o) => !o.option_text && !o.option_image_url) ||
            q.options.filter((o) => o.is_correct).length !== 1 || !Number.isFinite(q.marks) || q.marks <= 0);
        if (invalid >= 0) return res.status(400).json({ success: false, message: `Question ${invalid + 1} is invalid. Check its subject, text, four options, correct answer and marks.` });
        const fullManager = ["admin", "administrator", "proprietor", "principal", "vice_principal"].includes(String(req.user?.role_name || "").trim().toLowerCase());
        if (!fullManager) {
            if (String(req.user?.role_name || "").trim().toLowerCase() !== "teacher") return res.status(403).json({ success: false, message: "You are not authorised to import questions." });
            for (const subjectId of [...new Set(normalized.map((q) => q.subject_id))]) {
                const access = await db.query(`
                    SELECT 1 FROM cbt_exam_subjects es
                    JOIN cbt_exams e ON e.id=es.exam_id AND e.school_id=es.school_id
                    JOIN teacher_assignments ta ON ta.subject_id=es.subject_id AND ta.class_id=e.class_id
                      AND (ta.arm_id IS NULL OR e.arm_id IS NULL OR ta.arm_id=e.arm_id)
                    JOIN teachers t ON t.id=ta.teacher_id
                    JOIN users u ON u.id=t.user_id AND u.school_id=e.school_id
                    WHERE es.exam_id=$1 AND es.subject_id=$2 AND es.school_id=$3 AND u.id=$4 LIMIT 1
                `, [examId, subjectId, schoolId(req), Number(req.user.id)]);
                if (!access.rows[0]) return res.status(403).json({ success: false, message: "You can only import questions into subject sections assigned to you." });
            }
        }
        const result = await require("../models/cbtModel").bulkCreateExamQuestions(examId, schoolId(req), normalized, Number(req.user.id));
        return res.status(201).json({ success: true, message: `${result.length} question(s) imported into the selected examination.`, data: result });
    } catch (error) {
        return sendError(res, error);
    }
};
