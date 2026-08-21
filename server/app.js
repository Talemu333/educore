const cors = require("cors");
const express = require("express");
const routes = require("./routes");
const classRoutes = require("./routes/classRoutes");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const errorHandler = require("./middlewares/errorHandler");
const stateRoutes = require("./routes/stateRoutes");
const nationalityRoutes = require("./routes/nationalityRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const termRoutes = require("./routes/termRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const teacherAssignmentRoutes = require("./routes/teacherAssignmentRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const studentResultRoutes = require("./routes/studentResultRoutes");
const reportRoutes = require("./routes/reportRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeTypeRoutes = require("./routes/feeTypeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const feeStructureRoutes = require("./routes/feeStructureRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const armRoutes = require("./routes/armRoutes");
const parentRoutes = require("./routes/parentRoutes");
const relationshipRoutes = require("./routes/relationshipRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const qualificationRoutes = require("./routes/qualificationRoutes");
const classSubjectRoutes = require("./routes/classSubjectRoutes");
const schoolSettingRoutes = require("./routes/schoolSettingRoutes");
const gradingSystemRoutes = require("./routes/gradingSystemRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const promotionHistoryRoutes = require("./routes/promotionHistoryRoutes");





const app = express();

// app.use(cors({origin: "http://localhost:5173",credentials: true,}));
const allowedOrigins = [
    "http://localhost:5173",
    "https://educore-ivory.vercel.app",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,      // Change to true when using HTTPS
        sameSite: "lax"
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);
app.use("/api/classes", classRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/nationalities", nationalityRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teacher-assignments", teacherAssignmentRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/results", studentResultRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/fee-types",feeTypeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fee-structures",feeStructureRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/password",passwordRoutes);
app.use("/api/arms", armRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/relationships",relationshipRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/class-subjects", classSubjectRoutes);
app.use("/api/school-settings", schoolSettingRoutes);
app.use("/api/grading-scales", gradingSystemRoutes);
app.use("/api/website",websiteRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/promotion-history",promotionHistoryRoutes);




app.use(errorHandler);
module.exports = app;