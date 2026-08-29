const bcrypt =
    require("bcrypt");

const userModel =
    require("../models/userModel");

const roleModel =
    require("../models/roleModel");


/*
=========================================
GET ALL ADMINISTRATORS
=========================================
*/

const getAdmins = async (
    schoolId
) => {

    return await userModel.getAdmins(
        schoolId
    );

};


/*
=========================================
GET ADMIN ROLE
=========================================
*/

const getAdminRole = async () => {

    const role =
        await roleModel.getRoleByName(
            "admin"
        );


    if (!role) {

        throw new Error(
            "Admin role does not exist."
        );

    }


    return role;

};


/*
=========================================
CREATE ADMINISTRATOR
=========================================
*/

const createAdministrator = async ({
    username,
    email,
    password,
    admin_type,
    schoolId
}) => {

    const adminRole =
        await getAdminRole();

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    const administrator =
        await userModel.createAdministrator(
            {
                username,
                email,
                password: hashedPassword,
                role_id: adminRole.id,
                admin_type
            },
            schoolId
        );

    return {
        ...administrator,
        role_name:
            adminRole.role_name
    };

};


/*
=========================================
ACTIVATE ADMINISTRATOR
=========================================
*/

const activateAdministrator = async (
    userId,
    schoolId
) => {

    return await userModel.activateAdmin(
        userId,
        schoolId
    );

};


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

const deactivateAdministrator = async (
    userId,
    schoolId
) => {

    return await userModel.deactivateAdmin(
        userId,
        schoolId
    );

};


module.exports = {
    getAdmins,
    getAdminRole,
    createAdministrator,
    activateAdministrator,
    deactivateAdministrator
};
