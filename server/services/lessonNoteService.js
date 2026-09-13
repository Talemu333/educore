const ApiError = require("../utils/ApiError");
const lessonNoteModel = require("../models/lessonNoteModel");
const teacherModel = require("../models/teacherModel");

const ACADEMIC_ROLES = new Set(["Admin", "Teacher"]);
const REVIEW_ROLES = new Set(["Admin"]);

const getTeacherId = async (user, schoolId) => {
    if (user?.role_name !== "Teacher") return null;
    const teacher = await teacherModel.getTeacherByUserId(user.id, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher profile not found.");
    return teacher.id;
};

const validatePayload = async (data, schoolId, user, existing = null) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    if (!data.topic?.trim()) throw new ApiError(400, "Lesson topic is required.");
    const week = Number(data.week_number);
    if (!Number.isInteger(week) || week < 1 || week > 52) throw new ApiError(400, "Week must be between 1 and 52.");
    if (!data.class_id || !data.subject_id || !data.session_id || !data.term_id) throw new ApiError(400, "Class, subject, session and term are required.");

    const teacherId = user.role_name === "Teacher" ? await getTeacherId(user, schoolId) : Number(data.teacher_id || existing?.teacher_id);
    if (!teacherId) throw new ApiError(400, "A teacher is required for the lesson note.");

    if (user.role_name === "Teacher" && existing && Number(existing.teacher_id) !== Number(teacherId)) {
        throw new ApiError(403, "You can only manage your own lesson notes.");
    }

    const contextOk = await lessonNoteModel.validateContext({ ...data, teacher_id: teacherId }, schoolId);
    if (!contextOk) throw new ApiError(400, "The selected teacher is not assigned to this subject and class for the selected session and term.");

    return teacherId;
};

const list = async (filters, user) => {
    if (!ACADEMIC_ROLES.has(user?.role_name)) throw new ApiError(403, "You are not authorized to access lesson notes.");
    return lessonNoteModel.list(filters, user.school_id, user);
};

const get = async (id, user) => {
    const note = await lessonNoteModel.getById(id, user.school_id);
    if (!note) throw new ApiError(404, "Lesson note not found.");
    if (user.role_name === "Teacher") {
        const teacherId = await getTeacherId(user, user.school_id);
        if (Number(note.teacher_id) !== Number(teacherId)) throw new ApiError(403, "You can only access your own lesson notes.");
    }
    return note;
};

const create = async (data, user) => {
    const teacherId = await validatePayload(data, user.school_id, user);
    return lessonNoteModel.create({ ...data, teacher_id: teacherId, status: "draft" }, user.school_id);
};

const update = async (id, data, user) => {
    const existing = await lessonNoteModel.getById(id, user.school_id);
    if (!existing) throw new ApiError(404, "Lesson note not found.");
    if (!["draft", "returned"].includes(existing.status)) throw new ApiError(400, "Only draft or returned lesson notes can be edited.");
    const teacherId = await validatePayload({ ...data, teacher_id: existing.teacher_id }, user.school_id, user, existing);
    return lessonNoteModel.update(id, { ...data, teacher_id: teacherId, status: "draft" }, user.school_id);
};

const submit = async (id, user) => {
    const note = await lessonNoteModel.getById(id, user.school_id);
    if (!note) throw new ApiError(404, "Lesson note not found.");
    if (user.role_name === "Teacher") {
        const teacherId = await getTeacherId(user, user.school_id);
        if (Number(note.teacher_id) !== Number(teacherId)) throw new ApiError(403, "You can only submit your own lesson notes.");
    }
    if (!["draft", "returned"].includes(note.status)) throw new ApiError(400, "Only draft or returned lesson notes can be submitted.");
    return lessonNoteModel.setStatus(id, "submitted", null, null, user.school_id);
};

const review = async (id, action, comment, user) => {
    if (!REVIEW_ROLES.has(user?.role_name)) throw new ApiError(403, "Only school administrators can review lesson notes.");
    if (!["approve", "return"].includes(action)) throw new ApiError(400, "Review action must be approve or return.");
    const note = await lessonNoteModel.getById(id, user.school_id);
    if (!note) throw new ApiError(404, "Lesson note not found.");
    if (note.status !== "submitted") throw new ApiError(400, "Only submitted lesson notes can be reviewed.");
    if (action === "return" && !comment?.trim()) throw new ApiError(400, "Please provide a comment when returning a lesson note.");
    return lessonNoteModel.setStatus(id, action === "approve" ? "approved" : "returned", user.id, comment, user.school_id);
};

const duplicate = async (id, user) => {
    const source = await lessonNoteModel.getById(id, user.school_id);
    if (!source) throw new ApiError(404, "Lesson note not found.");
    let teacherId = source.teacher_id;
    if (user.role_name === "Teacher") {
        teacherId = await getTeacherId(user, user.school_id);
        if (Number(source.teacher_id) !== Number(teacherId)) throw new ApiError(403, "You can only duplicate your own lesson notes.");
    }
    return lessonNoteModel.duplicate(id, teacherId, user.school_id);
};

const meta = user => lessonNoteModel.getMeta(user.school_id, user);

module.exports = { list, get, create, update, submit, review, duplicate, meta };
