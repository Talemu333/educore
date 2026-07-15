const passport = require("passport");

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

            req.logIn(user, (err) => {

                if (err) {

                    return next(err);

                }

                return res.json({
                    success: true,
                    message: "Login successful.",
                    user
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

module.exports = {

    login,

    logout

};