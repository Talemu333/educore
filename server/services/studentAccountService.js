const pool = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const studentAccountModel = require("../models/studentAccountModel");

const requireSchool = (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
};

const generateTemporaryPassword = () => {
    const random = crypto.randomBytes(6).toString("base64url");
    return `Edu@${random}`;
};

const createStudentAccount = async (studentId, schoolId) => {
    requireSchool(schoolId);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const student = await studentAccountModel.getStudent(studentId, schoolId, client);
        if (!student) throw new ApiError(404, "Student not found.");
        if (student.status !== "Active") throw new ApiError(400, "Only active students can have login accounts.");

        const existing = await studentAccountModel.getStudentAccount(studentId, schoolId, client);
        if (existing) throw new ApiError(409, "This student already has a login account.");

        const roleId = await studentAccountModel.getStudentRoleId(client);
        if (!roleId) throw new ApiError(500, "Student role is not configured in the database.");

        const baseUsername = String(student.admission_number).trim();
        let username = baseUsername;
        let suffix = 1;
        while (await studentAccountModel.usernameExists(username, schoolId, client)) {
            username = `${baseUsername}-${suffix++}`;
        }

        const temporaryPassword = generateTemporaryPassword();
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        const account = await studentAccountModel.createStudentAccount({
            studentId,
            schoolId,
            username,
            passwordHash,
            roleId
        }, client);

        await client.query("COMMIT");

        return {
            ...account,
            temporary_password: temporaryPassword,
            student: {
                id: student.id,
                admission_number: student.admission_number,
                name: [student.surname, student.first_name, student.middle_name].filter(Boolean).join(" ")
            }
        };
    } catch (error) {
        await client.query("ROLLBACK");
        if (error.code === "23505") throw new ApiError(409, "A login account already exists for this student.");
        throw error;
    } finally {
        client.release();
    }
};

const getStudentAccount = async (studentId, schoolId) => {
    requireSchool(schoolId);
    const account = await studentAccountModel.getStudentAccount(studentId, schoolId);
    if (!account) throw new ApiError(404, "Student login account not found.");
    return account;
};

module.exports = { createStudentAccount, getStudentAccount };
