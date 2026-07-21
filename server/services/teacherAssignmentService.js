const ApiError = require("../utils/ApiError");

const teacherAssignmentModel = require("../models/teacherAssignmentModel");

const teacherModel = require("../models/teacherModel");
const subjectModel = require("../models/subjectModel");
const classModel = require("../models/classModel");
const armModel = require("../models/armModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");

const createAssignment = async (assignment) => {

    const teacher = await teacherModel.getTeacherById(
        assignment.teacher_id
    );

    if (!teacher) {
        throw new ApiError(404, "Teacher not found.");
    }

    const subject = await subjectModel.getSubjectById(
        assignment.subject_id
    );

    if (!subject) {
        throw new ApiError(404, "Subject not found.");
    }

    const schoolClass = await classModel.getClassById(
        assignment.class_id
    );

    if (!schoolClass) {
        throw new ApiError(404, "Class not found.");
    }

    if (assignment.arm_id) {

        const arm = await armModel.getArmById(
            assignment.arm_id
        );

        if (!arm) {
            throw new ApiError(404, "Arm not found.");
        }

    }

    const session = await sessionModel.getSessionById(
        assignment.session_id
    );

    if (!session) {
        throw new ApiError(404, "Academic session not found.");
    }

    const term = await termModel.getTermById(
        assignment.term_id
    );

    if (!term) {
        throw new ApiError(404, "Term not found.");
    }

    if (term.session_id !== assignment.session_id) {
        throw new ApiError(
            400,
            "Selected term does not belong to the selected academic session."
        );
    }

    const createdAssignment =
        await teacherAssignmentModel.createAssignment(
            assignment
        );

    return await teacherAssignmentModel.getAssignmentById(
        createdAssignment.id
    );

};
const getAssignmentsByTeacher = async (teacherId) => {

    const teacher =
        await teacherModel.getTeacherById(teacherId);

    if (!teacher) {

        throw new ApiError(
            404,
            "Teacher not found."
        );

    }

    const assignments =
        await teacherAssignmentModel.getAssignmentsByTeacher(
            teacherId
        );

    return {

        teacher: {

            id: teacher.id,

            staff_number: teacher.staff_number,

            full_name:
                `${teacher.surname} ${teacher.first_name}`

        },

        totalAssignments: assignments.length,

        assignments

    };

};

module.exports = {
    createAssignment,
    getAssignmentsByTeacher
};