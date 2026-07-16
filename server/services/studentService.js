const pool = require("../config/database");
const studentModel = require("../models/studentModel");
const generateAdmissionNumber = require("../utils/admissionNumberGenerator");

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
            throw new Error("Selected arm does not belong to the selected class.");
        }

        const admission = await generateAdmissionNumber();

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

module.exports = {

    createStudent,

    getAllStudents

};

