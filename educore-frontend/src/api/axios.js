import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
    throw new Error("VITE_API_URL must be configured for the production frontend.");
}

const api = axios.create({
    baseURL: apiBaseUrl || "http://localhost:5000/api",
    withCredentials: true,
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
    const schoolIdFromUrl = new URLSearchParams(window.location.search).get("schoolId");

    if (path === "/settings" && schoolIdFromUrl) {
        const schoolId = sessionStorage.getItem("educore_super_admin_school_id");
        if (schoolId && schoolId === schoolIdFromUrl) {
            config.headers["X-School-Id"] = schoolId;
        }
    }

    const apiPath = String(config.url || "");
    const isPublicWebsiteRequest =
        apiPath.startsWith("/website/") ||
        apiPath === "/website" ||
        apiPath === "/school-settings";
    const firstSegment = path.split("/").filter(Boolean)[0] || "";

    if (isPublicWebsiteRequest && firstSegment && !RESERVED_PUBLIC_PREFIXES.has(firstSegment)) {
        const params = new URLSearchParams(config.params || {});
        params.set("schoolSlug", firstSegment);
        config.params = params;
    }

    return config;
});

export default api;
