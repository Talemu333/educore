const express = require("express");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to EDUCORE API 🚀");
});

// About Route
app.get("/about", (req, res) => {
    res.send("EDUCORE School Management System API");
});

module.exports = app;