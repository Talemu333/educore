const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const authModel = require("../models/authModel");


passport.use(
    new LocalStrategy(
        {
            usernameField: "login",
            passwordField: "password"
        },

        async (login, password, done) => {

            try {

                const user =
                    await authModel.findUser(login);


                /*
                =========================================
                USER NOT FOUND
                =========================================
                */

                if (!user) {

                    return done(null, false, {

                        message:
                            "Invalid username/email or password."

                    });

                }


                /*
                =========================================
                CHECK ACCOUNT STATUS
                =========================================
                */

                if (user.is_active === false) {

                    return done(null, false, {

                        message:
                            "Your account has been deactivated. Please contact the school administrator."

                    });

                }


                /*
                =========================================
                CHECK PASSWORD
                =========================================
                */

                const match =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                if (!match) {

                    return done(null, false, {

                        message:
                            "Invalid username/email or password."

                    });

                }


                /*
                =========================================
                AUTHENTICATION SUCCESSFUL
                =========================================
                */

                return done(
                    null,
                    user
                );


            } catch (err) {

                return done(err);

            }

        }

    )
);


/*
=========================================
SERIALIZE USER
=========================================
*/

passport.serializeUser(
    (user, done) => {

        done(
            null,
            user.id
        );

    }
);


/*
=========================================
DESERIALIZE USER
=========================================
*/

passport.deserializeUser(
    async (serializedUser, done) => {

        try {

            // Older sessions may contain the serialized user object rather
            // than only the numeric user ID. Normalize both formats so a
            // legacy session cannot be passed directly to PostgreSQL as an
            // object (which causes: invalid input syntax for type integer).
            const candidateId =
                serializedUser &&
                typeof serializedUser === "object"
                    ? serializedUser.id
                    : serializedUser;

            const userId = Number(candidateId);

            if (!Number.isInteger(userId) || userId < 1) {

                return done(
                    null,
                    false
                );

            }

            const user =
                await authModel.findUserById(
                    userId
                );


            /*
            =====================================
            USER NO LONGER EXISTS
            =====================================
            */

            if (!user) {

                return done(
                    null,
                    false
                );

            }


            /*
            =====================================
            CHECK ACCOUNT STATUS AGAIN
            =====================================
            */

            if (user.is_active === false) {

                return done(
                    null,
                    false
                );

            }


            done(
                null,
                user
            );


        } catch (err) {

            done(
                err
            );

        }

    }
);