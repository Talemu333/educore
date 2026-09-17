import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
    throw new Error("VITE_API_URL must be configured for the production frontend.");
}

const api = axios.create({
    baseURL: apiBaseUrl || "http://localhost:5000/api",
    withCredentials: true,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
});

const RESERVED_PUBLIC_PREFIXES = new Set([
    "", "website", "dashboard", "students", "teachers", "parents",
    "attendance", "results", "timetable", "payments", "announcements",
    "settings", "administrators", "student-promotion", "promotion-history",
    "class-subjects", "admin", "login"
]);

api.interceptors.request.use((config) => {
    const path = window.location.pathname;
    const hostname = window.location.hostname.toLowerCase();
    const schoolIdFromUrl = new URLSearchParams(window.location.search).get("schoolId");
    const selectedSchoolId = sessionStorage.getItem("educore_super_admin_school_id");

    // A Super Admin may operate inside a selected school's dashboard. Send
    // the selected school context with every API request. The backend only
    // honors X-School-Id for an authenticated Super Admin, so this cannot
    // change the school context of ordinary school users.
    if (selectedSchoolId) {
        config.headers["X-School-Id"] = selectedSchoolId;
    }

    if (path === "/settings" && schoolIdFromUrl) {
        const schoolId = sessionStorage.getItem("educore_super_admin_school_id");
        if (schoolId && schoolId === schoolIdFromUrl) {
            config.headers["X-School-Id"] = schoolId;
        }
    }

    // The API is hosted separately from the school frontend (for example on Render),
    // so req.hostname on the API server is not the school's browser hostname.
    // Send the school domain explicitly for every school-portal request, including
    // login and /auth/me, so the backend resolves the correct dedicated database.
    const isPlatformDomain =
        hostname === "eduprow.com" ||
        hostname === "www.eduprow.com" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".vercel.app");

    if (!isPlatformDomain && hostname) {
        config.headers["X-School-Domain"] = hostname;
    }

    const apiPath = String(config.url || "");
    const isPublicWebsiteRequest =
        apiPath.startsWith("/website/") ||
        apiPath === "/website" ||
        apiPath === "/school-settings";

    if (!isPublicWebsiteRequest) return config;

    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;
    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    if (isCustomSchoolDomain) {
        const params = new URLSearchParams(config.params || {});
        params.set("schoolDomain", hostname);
        config.params = params;
        return config;
    }

    if (isEduProwSubdomain) return config;

    const firstSegment = path.split("/").filter(Boolean)[0] || "";

    if (firstSegment && !RESERVED_PUBLIC_PREFIXES.has(firstSegment)) {
        const params = new URLSearchParams(config.params || {});
        params.set("schoolSlug", firstSegment);
        config.params = params;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            const isTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
            const message = isTimeout
                ? "The request took too long. Please check your connection and try again."
                : "Unable to connect to EduProw. Please check your internet connection and try again.";

            // Keep the error shape compatible with existing pages that read
            // error.response.data.message, while retaining the original Axios error.
            error.response = {
                status: 0,
                data: {
                    success: false,
                    message
                }
            };
            error.isNetworkError = true;
            error.userMessage = message;
        }

        return Promise.reject(error);
    }
);

export default api;
