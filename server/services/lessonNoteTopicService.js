const ApiError = require("../utils/ApiError");
const topicModel = require("../models/lessonNoteTopicModel");

const ACADEMIC_ROLES = new Set(["Admin", "Teacher"]);

const validate = data => {
    if (!data.session_id || !data.term_id || !data.class_id || !data.subject_id) {
        throw new ApiError(400, "Session, term, class and subject are required.");
    }
    const week = Number(data.week_number);
    if (!Number.isInteger(week) || week < 1 || week > 52) {
        throw new ApiError(400, "Week must be between 1 and 52.");
    }
    if (!data.topic?.trim()) throw new ApiError(400, "Topic is required.");
};

const list = async (filters, user) => {
    if (!ACADEMIC_ROLES.has(user?.role_name)) throw new ApiError(403, "You are not authorized to access lesson topics.");
    return topicModel.list(filters, user.school_id, user);
};

const create = async (data, user) => {
    if (user?.role_name !== "Admin") throw new ApiError(403, "Only school administrators can manage syllabus topics.");
    validate(data);
    return topicModel.create(data, user.school_id);
};

const update = async (id, data, user) => {
    if (user?.role_name !== "Admin") throw new ApiError(403, "Only school administrators can manage syllabus topics.");
    validate(data);
    const existing = await topicModel.getById(id, user.school_id);
    if (!existing) throw new ApiError(404, "Syllabus topic not found.");
    return topicModel.update(id, data, user.school_id);
};

const remove = async (id, user) => {
    if (user?.role_name !== "Admin") throw new ApiError(403, "Only school administrators can manage syllabus topics.");
    const removed = await topicModel.remove(id, user.school_id);
    if (!removed) throw new ApiError(404, "Syllabus topic not found.");
    return { id: Number(id) };
};

module.exports = { list, create, update, remove };
