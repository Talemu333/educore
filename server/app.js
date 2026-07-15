const express = require("express");
const routes = require("./routes");
const classRoutes = require("./routes/classRoutes");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);
app.use("/api/classes", classRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;