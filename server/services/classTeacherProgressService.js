const ApiError = require("../utils/ApiError");
const model = require("../models/classTeacherProgressModel");

const listMyClasses = async (user) => {
    const schoolId = Number(user?.school_id);
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new ApiError(403, "School context is required.");
    return model.listMyClasses(user.id, schoolId);
};

const listClassStudents = async (assignmentId, user) => {
    const schoolId = Number(user?.school_id);
    const id = Number(assignmentId);
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new ApiError(403, "School context is required.");
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, "Invalid class teacher assignment.");
    const students = await model.listClassStudents(id, user.id, schoolId);
    if (!students.length) {
        const classes = await model.listMyClasses(user.id, schoolId);
        if (!classes.some(item => Number(item.assignment_id) === id)) {
            throw new ApiError(403, "You are not assigned as the class teacher for this class.");
        }
    }
    return students;
};

const createDraftReport = async (payload, user) => {
    const schoolId = Number(user?.school_id);
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new ApiError(403, "School context is required.");
    const assignmentId = Number(payload.assignment_id);
    const studentId = Number(payload.student_id);
    const termId = Number(payload.term_id);
    const reportType = String(payload.report_type || "");
    const start = new Date(payload.period_start);
    const end = new Date(payload.period_end);
    if (![assignmentId, studentId, termId].every(n => Number.isInteger(n) && n > 0)) {
        throw new ApiError(400, "Select a valid class, student and term.");
    }
    if (!["weekly", "midterm", "quarter_term", "end_of_term"].includes(reportType)) {
        throw new ApiError(400, "Select a valid report type.");
    }
    if (!payload.period_start || !payload.period_end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        throw new ApiError(400, "Enter a valid reporting period.");
    }
    for (const field of ["class_teacher_comment", "strengths", "areas_for_improvement"]) {
        if (payload[field] != null && (typeof payload[field] !== "string" || payload[field].length > 4000)) {
            throw new ApiError(400, "Report comments must be text no longer than 4,000 characters.");
        }
    }
    const report = await model.createDraftReport({
        assignment_id: assignmentId, student_id: studentId, term_id: termId,
        report_type: reportType, period_start: payload.period_start, period_end: payload.period_end,
        class_teacher_comment: payload.class_teacher_comment, strengths: payload.strengths,
        areas_for_improvement: payload.areas_for_improvement
    }, user.id, schoolId);
    if (!report) throw new ApiError(403, "The student is not enrolled in your assigned class/session, or the report is no longer editable.");
    return report;
};

const getSchoolId = (user) => {
    const schoolId = Number(user?.school_id);
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new ApiError(403, "School context is required.");
    return schoolId;
};

const submitDraftReport = async (reportId, user) => {
    const id = Number(reportId);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, "Invalid progress report.");
    const report = await model.submitDraftReport(id, user.id, getSchoolId(user));
    if (!report) throw new ApiError(409, "This report is not editable by you or is no longer available for submission.");
    return report;
};

const listReportsForReview = async (user) => model.listReportsForReview(getSchoolId(user));

const reviewReport = async (reportId, payload, user) => {
    const id = Number(reportId);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, "Invalid progress report.");
    const action = String(payload?.action || "");
    if (!["approve", "return"].includes(action)) throw new ApiError(400, "Choose approve or return.");
    const note = payload?.note;
    if (note != null && (typeof note !== "string" || note.length > 2000)) {
        throw new ApiError(400, "Review note must be text no longer than 2,000 characters.");
    }
    const report = await model.reviewReport(id, getSchoolId(user), user.id, action, note);
    if (!report) throw new ApiError(409, "Only submitted reports can be reviewed.");
    return report;
};

const publishReport = async (reportId, user) => {
    const id = Number(reportId);
    if (!Number.isInteger(id) || id < 1) throw new ApiError(400, "Invalid progress report.");
    const report = await model.publishReport(id, getSchoolId(user), user.id);
    if (!report) throw new ApiError(409, "Only approved reports can be published.");
    return report;
};

module.exports = {
    listMyClasses, listClassStudents, createDraftReport, submitDraftReport,
    listReportsForReview, reviewReport, publishReport
};
