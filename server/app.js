const express = require("express");
const routes = require("./routes");
const classRoutes = require("./routes/classRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);
app.use("/api/classes", classRoutes);


module.exports = app;