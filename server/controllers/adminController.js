const adminService =
    require("../services/adminService");


/*
=========================================
GET ALL ADMINISTRATORS
=========================================
*/

const getAdmins = async (
    req,
    res,
    next
) => {

    try {

        const administrators =
            await adminService.getAdmins();


        res.json({

            success: true,

            data: administrators

        });

    } catch (err) {

        next(err);

    }

};


/*
=========================================
CREATE ADMINISTRATOR
=========================================
*/

const createAdministrator = async (
    req,
    res,
    next
) => {

    try {

        const {
            username,
            email,
            password,
            admin_type
        } = req.body;


        /*
        =========================================
        VALIDATION
        =========================================
        */

        if (
            !username ||
            !password ||
            !admin_type
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Username, password and administrator type are required."

            });

        }


        /*
        =========================================
        ALLOWED ADMIN TYPES
        =========================================
        */

        const allowedAdminTypes = [

            "principal",

            "vice_principal",

            "bursar",

            "librarian"

        ];


        const normalizedAdminType =
            admin_type
                .trim()
                .toLowerCase();


        if (
            !allowedAdminTypes.includes(
                normalizedAdminType
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid administrator type."

            });

        }


        /*
        =========================================
        CREATE ADMINISTRATOR
        =========================================
        */

        const administrator =
            await adminService.createAdministrator({

                username:
                    username.trim(),

                email:
                    email?.trim() || null,

                password,

                admin_type:
                    normalizedAdminType

            });


        res.status(201).json({

            success: true,

            message:
                "Administrator account created successfully.",

            data:
                administrator

        });

    } catch (err) {

        /*
        =========================================
        DUPLICATE USERNAME / EMAIL
        =========================================
        */

        if (
            err.code === "23505"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Username or email already exists."

            });

        }


        next(err);

    }

};


/*
=========================================
ACTIVATE ADMINISTRATOR
=========================================
*/

const activateAdministrator = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const administrator =
            await adminService.activateAdministrator(
                id
            );


        if (!administrator) {

            return res.status(404).json({

                success: false,

                message:
                    "Administrator account not found."

            });

        }


        res.json({

            success: true,

            message:
                "Administrator account activated successfully.",

            data:
                administrator

        });

    } catch (err) {

        next(err);

    }

};


/*
=========================================
DEACTIVATE ADMINISTRATOR
=========================================
*/

const deactivateAdministrator = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const administrator =
            await adminService.deactivateAdministrator(
                id
            );


        if (!administrator) {

            return res.status(404).json({

                success: false,

                message:
                    "Administrator account not found or cannot be deactivated."

            });

        }


        res.json({

            success: true,

            message:
                "Administrator account deactivated successfully.",

            data:
                administrator

        });

    } catch (err) {

        next(err);

    }

};


module.exports = {

    getAdmins,

    createAdministrator,

    activateAdministrator,

    deactivateAdministrator

};