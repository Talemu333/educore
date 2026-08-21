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
    async (id, done) => {

        try {

            const user =
                await authModel.findUserById(
                    id
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