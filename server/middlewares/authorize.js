module.exports = (...allowedRoles) => {

    return (req, res, next) => {

        /*
        =========================================
        CHECK AUTHENTICATION
        =========================================
        */

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }


        /*
        =========================================
        USER ROLE
        =========================================
        */

        const userRole =
            req.user.role_name?.trim().toLowerCase();


        /*
        =========================================
        VALIDATE USER ROLE
        =========================================
        */

        if (!userRole) {

            return res.status(403).json({

                success: false,

                message: "User role is missing."

            });

        }


        /*
        =========================================
        NORMALIZE ALLOWED ROLES
        =========================================
        */

        const permittedRoles = allowedRoles

            .filter(
                role =>
                    typeof role === "string" &&
                    role.trim() !== ""
            )

            .map(
                role =>
                    role.trim().toLowerCase()
            );


        /*
        =========================================
        CHECK PERMISSION
        =========================================
        */

        if (
            !permittedRoles.includes(userRole)
        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }


        next();

    };

};