const bcrypt = require("bcrypt");
const schoolModel = require("../models/superAdminSchoolModel");

const normalize = (value) => typeof value === "string" ? value.trim() : value;

const validateCreate = ({ school, admin }) => {
    if (!school?.school_name || !school?.admission_prefix) {
        throw Object.assign(new Error("School name and admission prefix are required."), { status: 400 });
    }

    if (!admin?.username || !admin?.password) {
        throw Object.assign(new Error("Administrator username and password are required."), { status: 400 });
    }
};

const getSchools = () => schoolModel.getSchools();
const getSchoolById = (id) => schoolModel.getSchoolById(id);

const createSchool = async (payload) => {
    const school = {
        school_name: normalize(payload.school?.school_name),
        admission_prefix: normalize(payload.school?.admission_prefix),
        school_email: normalize(payload.school?.school_email),
        school_phone: normalize(payload.school?.school_phone),
        school_address: normalize(payload.school?.school_address),
        school_motto: normalize(payload.school?.school_motto),
        school_level: normalize(payload.school?.school_level)
    };

    const admin = {
        username: normalize(payload.admin?.username),
        email: normalize(payload.admin?.email)
    };

    validateCreate({ school, admin: { ...admin, password: payload.admin?.password } });

    const hashedPassword = await bcrypt.hash(payload.admin.password, 10);
    return schoolModel.createSchool(school, admin, hashedPassword);
};

const updateSchool = async (id, data) => schoolModel.updateSchool(id, {
    school_name: normalize(data.school_name),
    admission_prefix: normalize(data.admission_prefix),
    school_email: normalize(data.school_email),
    school_phone: normalize(data.school_phone),
    school_address: normalize(data.school_address),
    school_motto: normalize(data.school_motto),
    school_level: normalize(data.school_level)
});

const setSchoolStatus = async (id, isActive) => schoolModel.setSchoolStatus(id, isActive);

module.exports = {
    getSchools,
    getSchoolById,
    createSchool,
    updateSchool,
    setSchoolStatus
};
