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

                const user = await authModel.findUser(login);

                if (!user) {
                    return done(null, false, {
                        message: "Invalid username/email or password."
                    });
                }

                const match = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!match) {
                    return done(null, false, {
                        message: "Invalid username/email or password."
                    });
                }

                return done(null, user);

            } catch (err) {

                return done(err);

            }

        }
    )
);

passport.serializeUser((user, done) => {

    done(null, user.id);

});

passport.deserializeUser(async (id, done) => {

    try {

        const user = await authModel.findUserById(id);

        done(null, user);

    } catch (err) {

        done(err);

    }

});