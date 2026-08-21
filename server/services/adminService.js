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

const getAdmins = async () => {

    return await userModel.getAdmins();

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
    admin_type
}) => {

    /*
    =========================================
    GET ADMIN ROLE
    =========================================
    */

    const adminRole =
        await getAdminRole();


    /*
    =========================================
    HASH PASSWORD
    =========================================
    */

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );


    /*
    =========================================
    CREATE USER
    =========================================
    */

    const administrator =
        await userModel.createAdministrator({

            username,

            email,

            password:
                hashedPassword,

            role_id:
                adminRole.id,

            admin_type

        });


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
    userId
) => {

    return await userModel.activateAdmin(
        userId
    );

};


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

const deactivateAdministrator = async (
    userId
) => {

    return await userModel.deactivateAdmin(
        userId
    );

};


module.exports = {

    getAdmins,

    getAdminRole,

    createAdministrator,

    activateAdministrator,

    deactivateAdministrator

};