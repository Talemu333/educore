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
    const hostname = window.location.hostname.toLowerCase();
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

    if (!isPublicWebsiteRequest) return config;

    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;
    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    // On wildcard/custom school domains the hostname already identifies
    // the tenant. Never replace an explicit schoolDomain with a pathname
    // segment such as /about, /news or /gallery.
    if (isEduProwSubdomain || isCustomSchoolDomain) return config;

    const firstSegment = path.split("/").filter(Boolean)[0] || "";

    if (firstSegment && !RESERVED_PUBLIC_PREFIXES.has(firstSegment)) {
        const params = new URLSearchParams(config.params || {});
        params.set("schoolSlug", firstSegment);
        config.params = params;
    }

    return config;
});

export default api;
