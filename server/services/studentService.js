const { Client } = require("pg");
const pool = require("../config/database");
const studentModel = require("../models/studentModel");
const generateAdmissionNumber = require("../utils/admissionNumberGenerator");
const ApiError = require("../utils/ApiError");

const createStudent = async (studentData) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
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

        const admission = await generateAdmissionNumber(Client);
        studentData.admission_number = admission.admissionNumber;
        studentData.admission_sequence = admission.admissionSequence;

        const student = await studentModel.createStudent(
            client,
            studentData
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

const getAllStudents = async () => {

    return await studentModel.getAllStudents();

};

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

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent
};



