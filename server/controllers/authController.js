const passport = require("passport");
const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");

const login = (req, res, next) => {

    passport.authenticate(
        "local",
        (err, user, info) => {

            if (err) {

                return next(err);

            }

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: info.message
                });

            }

            req.logIn(user, async (err) => {

                if (err) {

                    return next(err);

                }

                try {
                    await authModel.updateLastLogin(user.id);
                } catch (error) {
                    console.error("Failed to update last login:", error);
                };

                return res.json({
                    success: true,
                    message: "Login successful.",  
                    user: {

                        id: user.id,

                        username: user.username,

                        email: user.email,

                        role_name: user.role_name,

                        must_change_password: user.must_change_password

                    }
                });

            });
            

        }
    )(req, res, next);

};

const logout = (req, res) => {

    req.logout(() => {

        res.json({

            success: true,

            message: "Logged out successfully."

        });

    });

};

const getCurrentUser = (req, res) => {

    if (!req.isAuthenticated()) {

        return res.status(401).json({
            success: false,
            message: "Not authenticated."
        });

    }

    res.json({
        success: true,
        user: req.user
    });

};

const changePassword = async (req, res, next) => {

    try {

        const {
            current_password,
            new_password
        } = req.body;


        if (!current_password) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password is required."

            });

        }


        if (!new_password) {

            return res.status(400).json({

                success: false,

                message:
                    "New password is required."

            });

        }


        if (new_password.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be at least 8 characters long."

            });

        }


        /*
        =====================================
        GET CURRENT USER
        =====================================
        */

        const user =
            await authModel.findUser(
                req.user.username
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User account not found."

            });

        }


        /*
        =====================================
        VERIFY CURRENT PASSWORD
        =====================================
        */

        const passwordMatches =
            await bcrypt.compare(

                current_password,

                user.password

            );


        if (!passwordMatches) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        /*
        =====================================
        PREVENT SAME PASSWORD
        =====================================
        */

        const samePassword =
            await bcrypt.compare(

                new_password,

                user.password

            );


        if (samePassword) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be different from your current password."

            });

        }


        /*
        =====================================
        HASH NEW PASSWORD
        =====================================
        */

        const hashedPassword =
            await bcrypt.hash(

                new_password,

                10

            );


        /*
        =====================================
        UPDATE DATABASE
        =====================================
        */

        await authModel.updatePassword(

            req.user.id,

            hashedPassword

        );


        res.json({

            success: true,

            message:
                "Password changed successfully."

        });


    } catch (error) {

        next(error);

    }

};

module.exports = {

    login,

    logout,

    getCurrentUser,
    changePassword

};