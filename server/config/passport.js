const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const authModel = require("../models/authModel");
const { getSchoolDatabase } = require("./schoolDatabaseManager");
const { runWithSchoolDatabase } = require("./databaseContext");

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

                if (user.is_active === false) {
                    return done(null, false, {
                        message: "Your account has been deactivated. Please contact the school administrator."
                    });
                }

                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return done(null, false, {
                        message: "Invalid username/email or password."
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, {
        id: user.id,
        school_id: user.school_id || null
    });
});

passport.deserializeUser(async (serialized, done) => {
    try {
        const userId = typeof serialized === "object"
            ? Number(serialized.id)
            : Number(serialized);

        const schoolId = typeof serialized === "object"
            ? Number(serialized.school_id)
            : 0;

        if (!Number.isInteger(userId) || userId < 1) {
            return done(null, false);
        }

        if (Number.isInteger(schoolId) && schoolId > 0) {
            const schoolPool = await getSchoolDatabase(schoolId);

            return runWithSchoolDatabase(schoolPool, async () => {
                const user = await authModel.findUserById(userId);

                if (!user || user.is_active === false) {
                    return done(null, false);
                }

                return done(null, user);
            });
        }

        const user = await authModel.findUserById(userId);

        if (!user || user.is_active === false) {
            return done(null, false);
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
});
