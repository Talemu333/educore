const ApiError = require("../utils/ApiError");

const teacherAssignmentModel = require("../models/teacherAssignmentModel");
const teacherAssignmentService = require("./teacherAssignmentService");

const teacherModel = require("../models/teacherModel");
const subjectModel = require("../models/subjectModel");
const classModel = require("../models/classModel");
const armModel = require("../models/armModel");
const sessionModel = require("../models/sessionModel");
const termModel = require("../models/termModel");

const validateAssignment = async (assignment, assignmentId = null) => {

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

    const duplicate =
        await teacherAssignmentModel.findDuplicateAssignment(
            assignment
        );

    if (
        duplicate &&
        duplicate.id !== Number(assignmentId)
    ) {

        throw new ApiError(

            409,

            "This teacher has already been assigned to this subject for the selected class, arm, term and session."

        );

    }

};

const createAssignment = async (assignment) => {

    await validateAssignment(assignment);

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

const deleteAssignment = async (id) => {

    const assignment =
        await teacherAssignmentModel.getAssignmentDetails(id);

    if (!assignment) {

        throw new ApiError(

            404,

            "Assignment not found."

        );

    }

    try {

        await teacherAssignmentModel.deleteAssignment(id);

    }

    catch (error) {

        if (error.code === "23503") {

            throw new ApiError(

                400,

                "Cannot delete this assignment because it is already used in the timetable."

            );

        }

        throw error;

    }

};

const updateAssignment = async (

    id,

    assignment

) => {

    const existing =
        await teacherAssignmentModel.getAssignmentDetails(id);

    if (!existing) {

        throw new ApiError(

            404,

            "Assignment not found."

        );

    }

    await validateAssignment(

        assignment,

        id

    );

    const updated =
        await teacherAssignmentModel.updateAssignment(

            id,

            assignment

        );

    return await teacherAssignmentModel.getAssignmentById(
        updated.id
    );

};

const getMyAssignments = async (user) => {

    const teacher =

        await teacherModel.getTeacherByUserId(

            user.id

        );

    if (!teacher) {

        throw new ApiError(

            404,

            "Teacher profile not found."

        );

    }

    return await getAssignmentsByTeacher(

        teacher.id

    );

};

const getAllAssignments = async () => {

    const assignments =
        await teacherAssignmentModel.getAllAssignments();

    return {

        totalAssignments:
            assignments.length,

        assignments

    };

};const getAssignmentForTeacherAttendance = async (
    assignmentId,
    userId
) => {

    const teacher =
        await teacherModel.getTeacherByUserId(
            userId
        );

    if (!teacher) {

        throw new ApiError(
            404,
            "Teacher profile not found."
        );

    }

    const assignment =
        await teacherAssignmentModel
            .getAssignmentForAttendance(
                assignmentId
            );

    if (!assignment) {

        throw new ApiError(
            404,
            "Assignment not found."
        );

    }

    if (
        Number(assignment.teacher_id) !==
        Number(teacher.id)
    ) {

        throw new ApiError(
            403,
            "You are not authorized to access this assignment."
        );

    }

    return assignment;

};

const getMyStudents = async (user) => {

    const teacher =
        await teacherModel.getTeacherByUserId(
            user.id
        );

    if (!teacher) {

        throw new ApiError(
            404,
            "Teacher profile not found."
        );

    }

    const students =
        await teacherAssignmentModel.getStudentsByTeacher(
            teacher.id
        );

    return {

        teacher: {

            id: teacher.id,

            staff_number:
                teacher.staff_number,

            full_name:
                `${teacher.surname} ${teacher.first_name}`

        },

        totalStudents:
            students.length,

        students

    };

};



module.exports = {
    createAssignment,
    getAssignmentsByTeacher,
    deleteAssignment,
    updateAssignment,
    getMyAssignments,
    getAllAssignments,
    getAssignmentForTeacherAttendance,
    getMyStudents
};