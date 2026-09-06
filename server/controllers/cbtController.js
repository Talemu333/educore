const cbtModel = require("../models/cbtModel");
const ApiError = require("../utils/ApiError");

const schoolId = (req) => Number(req.user.school_id);
const userId = (req) => Number(req.user.id);

const studentId = (req) => {
    const id = Number(req.user.student_id);
    if (!Number.isInteger(id) || id < 1) {
        throw new ApiError(403, "This student account is not linked to a student record.");
    }
    return id;
};

const sendError = (res, error) => res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to process CBT request." });

const getExams = async (req, res) => {
    try { return res.json({ success: true, data: await cbtModel.getExams(schoolId(req), req.query) }); }
    catch (error) { return sendError(res, error); }
};

const getAvailableStudentExams = async (req, res) => {
    try { return res.json({ success: true, data: await cbtModel.getAvailableStudentExams(studentId(req), schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
};

const getStudentExam = async (req, res) => {
    try {
        const exams = await cbtModel.getAvailableStudentExams(studentId(req), schoolId(req));
        const exam = exams.find((item) => Number(item.id) === Number(req.params.id));
        if (!exam) return res.status(404).json({ success: false, message: "This examination is not available to you." });

        const questions = await cbtModel.getQuestions(exam.id, schoolId(req));
        const safeQuestions = questions.map((question) => ({
            id: question.id,
            question_text: question.question_text,
            image_url: question.image_url,
            marks: question.marks,
            question_order: question.question_order,
            options: (question.options || []).map((option) => ({
                id: option.id,
                option_text: option.option_text,
                option_image_url: option.option_image_url,
                option_order: option.option_order
            }))
        }));

        return res.json({ success: true, data: { ...exam, questions: safeQuestions } });
    } catch (error) { return sendError(res, error); }
};

const getExam = async (req, res) => {
    try {
        const exam = await cbtModel.getExamById(Number(req.params.id), schoolId(req));
        if (!exam) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, data: { ...exam, questions: await cbtModel.getQuestions(exam.id, schoolId(req)) } });
    } catch (error) { return sendError(res, error); }
};

const createExam = async (req, res) => {
    try { return res.status(201).json({ success: true, data: await cbtModel.createExam(req.body, schoolId(req), userId(req)) }); }
    catch (error) { return sendError(res, error); }
};

const updateExam = async (req, res) => {
    try {
        const exam = await cbtModel.updateExam(Number(req.params.id), req.body, schoolId(req));
        if (!exam) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, data: exam });
    } catch (error) { return sendError(res, error); }
};

const deleteExam = async (req, res) => {
    try {
        const deleted = await cbtModel.deleteExam(Number(req.params.id), schoolId(req));
        if (!deleted) return res.status(404).json({ success: false, message: "Examination not found." });
        return res.json({ success: true, message: "Examination deleted." });
    } catch (error) { return sendError(res, error); }
};

const createQuestion = async (req, res) => {
    try { return res.status(201).json({ success: true, data: await cbtModel.createQuestion({ ...req.body, exam_id: Number(req.params.examId) }, schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
};

const updateQuestion = async (req, res) => {
    try {
        const question = await cbtModel.updateQuestion(Number(req.params.id), req.body, schoolId(req));
        if (!question) return res.status(404).json({ success: false, message: "Question not found." });
        return res.json({ success: true, data: question });
    } catch (error) { return sendError(res, error); }
};

const deleteQuestion = async (req, res) => {
    try {
        const deleted = await cbtModel.deleteQuestion(Number(req.params.id), schoolId(req));
        if (!deleted) return res.status(404).json({ success: false, message: "Question not found." });
        return res.json({ success: true, message: "Question deleted." });
    } catch (error) { return sendError(res, error); }
};

const startAttempt = async (req, res) => {
    try { return res.status(201).json({ success: true, data: await cbtModel.startAttempt(Number(req.params.examId), studentId(req), schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
};

const saveAnswer = async (req, res) => {
    try {
        const attemptStudentId = studentId(req);
        const attempts = await cbtModel.getStudentAttempts(attemptStudentId, schoolId(req));
        const attempt = attempts.find((item) => Number(item.id) === Number(req.params.attemptId));

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found." });
        }

        if (attempt.status !== "in_progress") {
            return res.status(409).json({ success: false, message: "This examination attempt is no longer active." });
        }

        if (attempt.expires_at && new Date(attempt.expires_at) <= new Date()) {
            await cbtModel.submitAttempt(Number(req.params.attemptId), attemptStudentId, schoolId(req));
            return res.status(409).json({ success: false, message: "Your examination time has expired." });
        }

        return res.json({ success: true, data: await cbtModel.saveAnswer(Number(req.params.attemptId), Number(req.body.question_id), req.body.selected_option_id ? Number(req.body.selected_option_id) : null, schoolId(req)) });
    } catch (error) { return sendError(res, error); }
};

const submitAttempt = async (req, res) => {
    try {
        const attempt = await cbtModel.submitAttempt(Number(req.params.attemptId), studentId(req), schoolId(req));
        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found." });
        return res.json({ success: true, data: attempt });
    } catch (error) { return sendError(res, error); }
};

const getMyAttempts = async (req, res) => {
    try { return res.json({ success: true, data: await cbtModel.getStudentAttempts(studentId(req), schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
};

module.exports = { getExams, getAvailableStudentExams, getStudentExam, getExam, createExam, updateExam, deleteExam, createQuestion, updateQuestion, deleteQuestion, startAttempt, saveAnswer, submitAttempt, getMyAttempts };
