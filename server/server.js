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
}

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 EDUCORE Server is running on port ${PORT}`);
});
