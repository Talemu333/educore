import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD
            ? "https://educore-api-7e1v.onrender.com/api"
            : "http://localhost:5000/api"),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// When the Super Admin is inside a school's management page, all existing
// school-scoped API calls must operate on the selected school rather than the
// Super Admin's own database school_id. The server validates this header and
// only honors it for an authenticated Super Admin.
api.interceptors.request.use((config) => {
    const path = window.location.pathname;
    if (path.startsWith("/settings/schools/")) {
        const schoolId = sessionStorage.getItem("educore_super_admin_school_id");
        if (schoolId) {
            config.headers["X-School-Id"] = schoolId;
        }
    }
    return config;
});

export default api;
