const cbtModel = require("../models/cbtModel");

const schoolId = (req) => Number(req.user.school_id);
const userId = (req) => Number(req.user.id);
const studentId = (req) => Number(req.user.student_id || req.user.studentId || req.user.id);

const sendError = (res, error) => res.status(400).json({ success: false, message: error.message || "Unable to process CBT request." });

const getExams = async (req, res) => {
    try { return res.json({ success: true, data: await cbtModel.getExams(schoolId(req), req.query) }); }
    catch (error) { return sendError(res, error); }
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
    try { return res.json({ success: true, data: await cbtModel.saveAnswer(Number(req.params.attemptId), Number(req.body.question_id), req.body.selected_option_id ? Number(req.body.selected_option_id) : null, schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
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

module.exports = { getExams, getExam, createExam, updateExam, deleteExam, createQuestion, updateQuestion, deleteQuestion, startAttempt, saveAnswer, submitAttempt, getMyAttempts };
