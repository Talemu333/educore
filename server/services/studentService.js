const pool = require("../config/database");
const studentModel = require("../models/studentModel");
const generateAdmissionNumber = require("../utils/admissionNumberGenerator");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");
const studentEnrollmentModel = require("../models/studentEnrollmentModel");
const sessionModel = require("../models/sessionModel");
const ENROLLMENT_STATUS = require("../config/enrollmentStatus");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const createStudent = async (studentData, schoolId) => {
    requireSchool(schoolId);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const session = await sessionModel.getSessionById(studentData.session_id, schoolId);
        if (!session) throw new ApiError(404, "Academic session not found.");

        const validArm = await studentModel.validateClassArm(client, studentData.class_id, studentData.arm_id, schoolId);
        if (!validArm) throw new ApiError(400, "Selected arm does not belong to the selected class and school.");

        const admission = await generateAdmissionNumber(client, schoolId);
        const data = { ...studentData, admission_number: admission.admissionNumber, admission_sequence: admission.admissionSequence };
        const student = await studentModel.createStudent(client, data, schoolId);

        await studentEnrollmentModel.createEnrollment({
            student_id: student.id,
            session_id: studentData.session_id,
            class_id: studentData.class_id,
            arm_id: studentData.arm_id,
            enrollment_date: studentData.admission_date,
            enrollment_status: ENROLLMENT_STATUS.ACTIVE
        }, client, schoolId);

        await client.query("COMMIT");
        return student;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally { client.release(); }
};

const getStudentById = async (id, schoolId) => {
    requireSchool(schoolId);
    const student = await studentModel.getStudentById(id, schoolId);
    if (!student) throw new ApiError(404, "Student not found.");
    return student;
};

const updateStudent = async (id, studentData, schoolId) => {
    requireSchool(schoolId);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const existingStudent = await studentModel.getStudentById(id, schoolId);
        if (!existingStudent) throw new ApiError(404, "Student not found.");

        const validArm = await studentModel.validateClassArm(client, studentData.class_id, studentData.arm_id, schoolId);
        if (!validArm) throw new ApiError(400, "Selected arm does not belong to the selected class and school.");

        const updated = await studentModel.updateStudent(client, id, studentData, schoolId);
        await client.query("COMMIT");
        return updated;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally { client.release(); }
};

const searchStudents = async (searchTerm, schoolId) => {
    requireSchool(schoolId);
    if (!searchTerm?.trim()) throw new ApiError(400, "Search term is required.");
    return studentModel.searchStudents(searchTerm, undefined, undefined, schoolId);
};

const getAllStudents = async (query, schoolId) => {
    requireSchool(schoolId);
    const { page, limit, offset } = getPagination(query);
    const search = query.search?.trim();
    let students, total;

    if (search) {
        students = await studentModel.searchStudents(search, limit, offset, schoolId);
        total = await studentModel.countSearchStudents(search, schoolId);
    } else {
        students = await studentModel.getAllStudents(limit, offset, schoolId);
        total = await studentModel.countStudents(schoolId);
    }

    return { page, limit, total, totalPages: Math.ceil(total / limit), data: students };
};

const deactivateStudent = async (id, schoolId) => {
    requireSchool(schoolId);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const student = await studentModel.deactivateStudent(client, id, schoolId);
        if (!student) throw new ApiError(404, "Student not found.");
        await client.query("COMMIT");
        return student;
    } catch (err) {
        await client.query("ROLLBACK");
        if (err.code === "23503") throw new ApiError(400, "This student cannot be deleted because academic records already exist.");
        throw err;
    } finally { client.release(); }
};

const getStudentParents = async (studentId, schoolId) => {
    await getStudentById(studentId, schoolId);
    return studentModel.getStudentParents(studentId, schoolId);
};

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, searchStudents, deactivateStudent, getStudentParents };
