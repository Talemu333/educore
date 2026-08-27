const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const { withTransaction } = require("./transactionService");
const teacherModel = require("../models/teacherModel");
const userModel = require("../models/userModel");
const schoolSettingModel = require("../models/schoolSettingModel");
const generateTemporaryPassword = require("../utils/passwordGenerator");
const generateStaffNumber = require("../utils/staffNumberGenerator");
const roleModel = require("../models/roleModel");
const ROLE_NAMES = require("../config/roleNames");
const { normalizeGender } = require("../helpers/normalizeHelper");

const createTeacher = async (teacherData, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");

    return await withTransaction(async (client) => {
        const existingUser = await userModel.getUserByUsername(teacherData.username, schoolId);
        if (existingUser) throw new ApiError(409, "Username already exists.");

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const school = await schoolSettingModel.getSchoolSettings(schoolId);
        const prefix = school.teacher_prefix;
        const teacherId = await teacherModel.getNextTeacherId(client);
        const staffNumber = generateStaffNumber(prefix, teacherId);
        const teacherRole = await roleModel.getRoleByName(ROLE_NAMES.TEACHER);
        if (!teacherRole) throw new ApiError(500, "Teacher role is not configured.");

        const user = await userModel.createUser(client, {
            username: teacherData.username,
            email: teacherData.email,
            password: hashedPassword,
            role_id: teacherRole.id
        }, schoolId);

        const teacher = await teacherModel.createTeacher(client, {
            id: teacherId,
            user_id: user.id,
            staff_number: staffNumber,
            surname: teacherData.surname,
            first_name: teacherData.first_name,
            middle_name: teacherData.middle_name,
            gender: normalizeGender(teacherData.gender),
            date_of_birth: teacherData.date_of_birth,
            phone_number: teacherData.phone_number,
            email: teacherData.email,
            address: teacherData.address,
            marital_status: teacherData.marital_status,
            qualification_id: teacherData.qualification_id,
            department_id: teacherData.department_id,
            employment_date: teacherData.employment_date,
            state_id: teacherData.state_id,
            nationality_id: teacherData.nationality_id,
            next_of_kin_name: teacherData.next_of_kin_name,
            next_of_kin_phone: teacherData.next_of_kin_phone,
            emergency_contact_name: teacherData.emergency_contact_name,
            emergency_contact_phone: teacherData.emergency_contact_phone
        }, schoolId);

        return { teacher, temporaryPassword };
    });
};

const getTeachers = async (schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return teacherModel.getTeachers(schoolId);
};

const getTeacherById = async (id, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    const teacher = await teacherModel.getTeacherById(id, schoolId);
    if (!teacher) throw new ApiError(404, "Teacher not found.");
    return teacher;
};

const updateTeacher = async (id, teacherData, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return withTransaction(async (client) => {
        const existingTeacher = await teacherModel.getTeacherById(id, schoolId);
        if (!existingTeacher) throw new ApiError(404, "Teacher not found.");
        return teacherModel.updateTeacher(client, id, {
            ...teacherData,
            gender: normalizeGender(teacherData.gender)
        }, schoolId);
    });
};

const deactivateTeacher = async (id, schoolId) => {
    if (!schoolId) throw new ApiError(403, "School context is required.");
    return withTransaction(async (client) => {
        const teacher = await teacherModel.getTeacherById(id, schoolId);
        if (!teacher) throw new ApiError(404, "Teacher not found.");
        return teacherModel.deactivateTeacher(client, id, schoolId);
    });
};

module.exports = { createTeacher, getTeachers, getTeacherById, updateTeacher, deactivateTeacher };