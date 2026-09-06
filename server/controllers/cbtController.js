const cbtModel = require("../models/cbtModel");
const pool = require("../config/database");
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

const validateQuestionOptions = (options) => {
    if (!Array.isArray(options) || options.length < 2) {
        throw new ApiError(400, "A multiple-choice question must have at least two options.");
    }
    const validOptions = options.filter((option) => option && String(option.option_text || "").trim());
    if (validOptions.length < 2) {
        throw new ApiError(400, "At least two answer options are required.");
    }
    const correctCount = validOptions.filter((option) => Boolean(option.is_correct)).length;
    if (correctCount !== 1) {
        throw new ApiError(400, "Each multiple-choice question must have exactly one correct answer.");
    }
};

const validateExam = (data) => {
    if (!String(data.title || "").trim()) throw new ApiError(400, "Examination title is required.");
    if (!Number.isFinite(Number(data.subject_id)) || !Number.isFinite(Number(data.class_id))) {
        throw new ApiError(400, "Subject and class are required.");
    }
    if (!Number.isFinite(Number(data.duration_minutes)) || Number(data.duration_minutes) <= 0) {
        throw new ApiError(400, "Examination duration must be greater than zero.");
    }
    if (data.status === "published" && (!Number.isFinite(Number(data.total_marks)) || Number(data.total_marks) <= 0)) {
        throw new ApiError(400, "A published examination must have total marks greater than zero.");
    }
    if (data.starts_at && data.ends_at && new Date(data.ends_at) <= new Date(data.starts_at)) {
        throw new ApiError(400, "Examination end time must be after the start time.");
    }
};

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
        const student = studentId(req);
        const school = schoolId(req);
        const exams = await cbtModel.getAvailableStudentExams(student, school);
        const exam = exams.find((item) => Number(item.id) === Number(req.params.id));
        if (!exam) return res.status(404).json({ success: false, message: "This examination is not available to you." });

        const attemptId = Number(req.query.attemptId);
        const attempt = Number.isInteger(attemptId) && attemptId > 0
            ? await cbtModel.getAttemptForStudent(attemptId, student, school)
            : null;

        if (attempt && Number(attempt.exam_id) !== Number(exam.id)) {
            return res.status(400).json({ success: false, message: "The examination attempt does not match this examination." });
        }

        const randomSeed = attempt
            ? (exam.randomize_questions || exam.randomize_options ? attempt.id : null)
            : null;
        const questions = await cbtModel.getQuestions(exam.id, school, randomSeed);
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
    try {
        validateExam(req.body);
        return res.status(201).json({ success: true, data: await cbtModel.createExam(req.body, schoolId(req), userId(req)) });
    } catch (error) { return sendError(res, error); }
};

const updateExam = async (req, res) => {
    try {
        validateExam(req.body);
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
    try {
        validateQuestionOptions(req.body.options);
        return res.status(201).json({ success: true, data: await cbtModel.createQuestion({ ...req.body, exam_id: Number(req.params.examId) }, schoolId(req)) });
    } catch (error) { return sendError(res, error); }
};

const updateQuestion = async (req, res) => {
    try {
        if (Array.isArray(req.body.options)) validateQuestionOptions(req.body.options);
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
    try {
        const examId = Number(req.params.examId);
        const school = schoolId(req);
        const questions = await cbtModel.getQuestions(examId, school);
        if (!questions.length) {
            return res.status(409).json({ success: false, message: "This examination has no questions yet." });
        }

        const attempt = await cbtModel.startAttempt(examId, studentId(req), school);

        // The student's timer can never run beyond the examination's closing time.
        const exam = await cbtModel.getExamById(examId, school);
        if (exam?.ends_at) {
            await pool.query(
                `UPDATE cbt_attempts
                 SET expires_at = LEAST(expires_at, $1::timestamptz), updated_at=CURRENT_TIMESTAMP
                 WHERE id=$2 AND student_id=$3 AND school_id=$4 AND status='in_progress'`,
                [exam.ends_at, attempt.id, studentId(req), school]
            );
            const refreshedAttempt = await cbtModel.getAttemptForStudent(attempt.id, studentId(req), school);
            return res.status(201).json({ success: true, data: refreshedAttempt });
        }

        return res.status(201).json({ success: true, data: attempt });
    } catch (error) { return sendError(res, error); }
};

const saveAnswer = async (req, res) => {
    try {
        const attemptStudentId = studentId(req);
        const school = schoolId(req);
        const attempts = await cbtModel.getStudentAttempts(attemptStudentId, school);
        const attempt = attempts.find((item) => Number(item.id) === Number(req.params.attemptId));

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found." });
        }

        if (attempt.status !== "in_progress") {
            return res.status(409).json({ success: false, message: "This examination attempt is no longer active." });
        }

        const exam = await cbtModel.getExamById(Number(attempt.exam_id), school);
        if (exam?.ends_at && new Date(exam.ends_at) <= new Date()) {
            await cbtModel.submitAttempt(Number(req.params.attemptId), attemptStudentId, school);
            return res.status(409).json({ success: false, message: "This examination has ended." });
        }

        if (attempt.expires_at && new Date(attempt.expires_at) <= new Date()) {
            await cbtModel.submitAttempt(Number(req.params.attemptId), attemptStudentId, school);
            return res.status(409).json({ success: false, message: "Your examination time has expired." });
        }

        const saved = await cbtModel.saveAnswer(
            Number(req.params.attemptId),
            Number(req.body.question_id),
            req.body.selected_option_id ? Number(req.body.selected_option_id) : null,
            school
        );

        if (!saved) {
            return res.status(400).json({ success: false, message: "Unable to save this answer." });
        }

        return res.json({ success: true, data: saved });
    } catch (error) { return sendError(res, error); }
};

const submitAttempt = async (req, res) => {
    try {
        const student = studentId(req);
        const school = schoolId(req);
        const existing = await cbtModel.getAttemptForStudent(Number(req.params.attemptId), student, school);
        if (!existing) return res.status(404).json({ success: false, message: "Attempt not found." });

        const attempt = await cbtModel.submitAttempt(Number(req.params.attemptId), student, school);
        return res.json({ success: true, data: attempt });
    } catch (error) { return sendError(res, error); }
};

const getMyAttempts = async (req, res) => {
    try { return res.json({ success: true, data: await cbtModel.getStudentAttempts(studentId(req), schoolId(req)) }); }
    catch (error) { return sendError(res, error); }
};

module.exports = { getExams, getAvailableStudentExams, getStudentExam, getExam, createExam, updateExam, deleteExam, createQuestion, updateQuestion, deleteQuestion, startAttempt, saveAnswer, submitAttempt, getMyAttempts };
