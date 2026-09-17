const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");
const generateTemporaryPassword = require("../utils/passwordGenerator");

const getAdmins = async (schoolId) => userModel.getAdmins(schoolId);

const getAdminRole = async () => {
    const role = await roleModel.getRoleByName("admin");
    if (!role) throw new Error("Admin role does not exist.");
    return role;
};

const createAdministrator = async ({ username, email, admin_type, schoolId }) => {
    const adminRole = await getAdminRole();
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const administrator = await userModel.createAdministrator({
        username,
        email,
        password: hashedPassword,
        role_id: adminRole.id,
        admin_type
    }, schoolId);

    return {
        ...administrator,
        role_name: adminRole.role_name,
        temporary_password: temporaryPassword
    };
};

const activateAdministrator = async (userId, schoolId) => userModel.activateAdmin(userId, schoolId);
const deactivateAdministrator = async (userId, schoolId) => userModel.deactivateAdmin(userId, schoolId);

module.exports = {
    getAdmins,
    getAdminRole,
    createAdministrator,
    activateAdministrator,
    deactivateAdministrator
};
