require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
    const required = [
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PASSWORD",
        "SESSION_SECRET",
        "FRONTEND_URL",
        "CORS_ORIGINS"
    ];

    const missing = required.filter((name) => !process.env[name]?.trim());

    if (missing.length > 0) {
        throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
    }

    const frontendUrl = process.env.FRONTEND_URL.trim();
    if (!frontendUrl.startsWith("https://")) {
        throw new Error("FRONTEND_URL must use HTTPS in production.");
    }

    const corsOrigins = process.env.CORS_ORIGINS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (corsOrigins.length === 0 || corsOrigins.some((origin) => !origin.startsWith("https://"))) {
        throw new Error("Every production CORS_ORIGINS entry must use HTTPS.");
    }

    if (process.env.SESSION_SECRET.trim().length < 32) {
        throw new Error("SESSION_SECRET must be at least 32 characters long in production.");
    }
}

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 EDUCORE Server is running on port ${PORT}`);
});
