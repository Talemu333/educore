const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const routes = require("./routes");
const classRoutes = require("./routes/classRoutes");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const pool = require("./config/database");
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
const superAdminSchoolRoutes = require("./routes/superAdminSchoolRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const cbtRoutes = require("./routes/cbtRoutes");
const cbtQuestionBankRoutes = require("./routes/cbtQuestionBankRoutes");
const cbtQuestionBankImportRoutes = require("./routes/cbtQuestionBankImportRoutes");
const bulkImportRoutes = require("./routes/bulkImportRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");
const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map(normalizeOrigin).filter(Boolean)
    : [];
const allowedOrigins = isProduction
    ? [...new Set(configuredOrigins)]
    : [...new Set(["http://localhost:5173", ...configuredOrigins])];

if (isProduction && allowedOrigins.length === 0) {
    throw new Error("CORS_ORIGINS must be configured in production.");
}

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
        return true;
    }

    try {
        const url = new URL(normalizedOrigin);
        const hostname = url.hostname.toLowerCase();

        return (
            url.protocol === "https:" &&
            hostname.endsWith(".eduprow.com") &&
            hostname !== "eduprow.com" &&
            hostname !== "www.eduprow.com"
        );
    } catch {
        return false;
    }
};

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        return res.json({ success: true, status: "ok" });
    } catch (error) {
        console.error("Health check database error:", error);
        return res.status(503).json({ success: false, status: "degraded" });
    }
});

app.use(session({
    store: new pgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
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
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fee-types", feeTypeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/fee-structures", feeStructureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/arms", armRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/class-subjects", classSubjectRoutes);
app.use("/api/school-settings", schoolSettingRoutes);
app.use("/api/grading-scales", gradingSystemRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/contact-messages", contactMessageRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/promotion-history", promotionHistoryRoutes);
app.use("/api/super-admin/schools", superAdminSchoolRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/cbt", cbtRoutes);
app.use("/api/cbt/question-bank", cbtQuestionBankRoutes);
app.use("/api/cbt-question-bank", cbtQuestionBankRoutes);
app.use("/api/cbt-question-bank/import-pdf", cbtQuestionBankImportRoutes);
app.use("/api/bulk-import", bulkImportRoutes);

app.use(errorHandler);
module.exports = app;