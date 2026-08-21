module.exports = (...allowedAdminTypes) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }


        /*
        =========================================
        USER MUST BE AN ADMIN
        =========================================
        */

        if (
            String(req.user.role_name).toLowerCase() !==
            "admin"
        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }


        /*
        =========================================
        CHECK ADMIN TYPE
        =========================================
        */

        if (
            !allowedAdminTypes.includes(
                req.user.admin_type
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only the proprietor can perform this action."

            });

        }


        next();

    };

};