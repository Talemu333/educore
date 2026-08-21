const { Client } = require("pg");
const pool = require("../config/database");
const studentModel = require("../models/studentModel");
const generateAdmissionNumber = require("../utils/admissionNumberGenerator");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");
const studentEnrollmentModel = require("../models/studentEnrollmentModel");
const sessionModel = require("../models/sessionModel");
const ENROLLMENT_STATUS = require("../config/enrollmentStatus");

const createStudent = async (studentData) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const session = await sessionModel.getSessionById(

            studentData.session_id

        );

        if (!session) {

            throw new ApiError(

                404,

                "Academic session not found."

            );

        }

        const validArm = await studentModel.validateClassArm(
            client,
            studentData.class_id,
            studentData.arm_id
        );

        if (!validArm) {
            throw new ApiError(
                400,
                "Selected arm does not belong to the selected class."
            );
        }

        const admission = await generateAdmissionNumber(client);
        studentData.admission_number = admission.admissionNumber;
        studentData.admission_sequence = admission.admissionSequence;

        const student = await studentModel.createStudent(
            client,
            studentData
        );

        await studentEnrollmentModel.createEnrollment(

            {

                student_id: student.id,

                session_id: studentData.session_id,

                class_id: studentData.class_id,

                arm_id: studentData.arm_id,

                enrollment_date: studentData.admission_date,

                enrollment_status: ENROLLMENT_STATUS.ACTIVE

            },

            client

        );

        await client.query("COMMIT");

        return student;

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};

// const getAllStudents = async () => {

//     return await studentModel.getAllStudents();

// };

const getStudentById = async (id) => {

    const student = await studentModel.getStudentById(id);

    if (!student) {

        throw new ApiError(404, "Student not found.");

    }

    return student;

};

const updateStudent = async (id, studentData) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // Check if student exists
        const existingStudent = await studentModel.getStudentById(id);

        if (!existingStudent) {
            throw new ApiError(404, "Student not found.");
        }

        // Validate class and arm
        const validArm = await studentModel.validateClassArm(
            client,
            studentData.class_id,
            studentData.arm_id
        );

        if (!validArm) {
            throw new ApiError(
                400,
                "Selected arm does not belong to the selected class."
            );
        }

        const updatedStudent = await studentModel.updateStudent(
            client,
            id,
            studentData
        );

        await client.query("COMMIT");

        return updatedStudent;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

const searchStudents = async (searchTerm) => {

    if (!searchTerm.trim()) {

        throw new ApiError(
            400,
            "Search term is required."
        );

    }

    return await studentModel.searchStudents(
        searchTerm
    );

};

const getAllStudents = async (query) => {

    const {

        page,

        limit,

        offset

    } = getPagination(query);

    const search = query.search?.trim();

    let students;
    let total;

    if (search) {

        students = await studentModel.searchStudents(
            search,
            limit,
            offset
        );

        total = await studentModel.countSearchStudents(search);

    } else {

        students = await studentModel.getAllStudents(
            limit,
            offset
        );

        total = await studentModel.countStudents();

    }

    return {

        page,

        limit,

        total,

        totalPages:

            Math.ceil(total / limit),

        data: students

    };

};

const deactivateStudent = async (id) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const student = await studentModel.deactivateStudent(

            client,

            id

        );

        if (!student) {

            throw new ApiError(

                404,

                "Student not found."

            );

        }

        await client.query("COMMIT");

        return student;

    } 
    catch (err) {

        await client.query("ROLLBACK");

        if (err.code === "23503") {

            throw new ApiError(

                400,

                "This student cannot be deleted because academic records already exist."

            );

        }

        throw err;

    } 
    
    finally {

        client.release();

    }

};

const getStudentParents = async (studentId) => {

    const student = await studentModel.getStudentById(studentId);

    if (!student) {

        throw new ApiError(404, "Student not found.");

    }

    return await studentModel.getStudentParents(studentId);

};


module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    searchStudents,
    deactivateStudent,
    getStudentParents
};



