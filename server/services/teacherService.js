// services/teacherService.js
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const { withTransaction } = require("./transactionService");
const teacherModel = require("../models/teacherModel");
const userModel = require("../models/userModel");
const schoolSettingModel = require("../models/schoolSettingModel");
const generateTemporaryPassword = require("../utils/passwordGenerator");
const generateStaffNumber = require("../utils/staffNumberGenerator");
const ROLES = require("../constants/roles");
const roleModel = require("../models/roleModel");
const ROLE_NAMES = require("../config/roleNames");

const createTeacher = async (teacherData) => {

    return await withTransaction(async (client) => {
        // business logic here
        const existingUser = await userModel.getUserByUsername(teacherData.username);
        if (existingUser) {
            throw new ApiError(
                409,
                "Username already exists."
            );
        }
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword,10);
        const school = await schoolSettingModel.getSchoolSettings();
        const prefix = school.teacher_prefix;
        const teacherId = await teacherModel.getNextTeacherId(client);
        const staffNumber = generateStaffNumber(prefix,teacherId);
        const teacherRole = await roleModel.getRoleByName(ROLE_NAMES.TEACHER);
        if (!teacherRole) {
            throw new ApiError(
                500,
                "Teacher role is not configured."
            );
        }
        const user = await userModel.createUser(client, {
            username: teacherData.username,
            password: hashedPassword,
            role_id: teacherRole.id
        });
        const teacher = await teacherModel.createTeacher(client, {
            id: teacherId,
            user_id: user.id,
            staff_number: staffNumber,
            surname: teacherData.surname,
            first_name: teacherData.first_name,
            middle_name: teacherData.middle_name,
            gender: teacherData.gender,
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

        });
        return {
            teacher,
            temporaryPassword
        };


    });

};

const getTeachers = async () => {

    return await teacherModel.getTeachers();

};

const getTeacherById = async (id) => {

    const teacher = await teacherModel.getTeacherById(id);

    if (!teacher) {

        throw new ApiError(
            404,
            "Teacher not found."
        );

    }

    return teacher;

};

module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById 
}