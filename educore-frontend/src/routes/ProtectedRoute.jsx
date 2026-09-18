import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "@/context/AuthContext";

function normalizeRole(role) {
    const normalized = String(role || "").trim().toLowerCase();
    return normalized === "administrator" ? "admin" : normalized;
}

function ProtectedRoute({
    children,
    allowedRoles,
    allowedAdminTypes
}) {
    const {
        user,
        isAuthenticated,
        loading
    } = useAuth();

    const location = useLocation();

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const userRole = normalizeRole(user?.role_name);
    const userAdminType = user?.admin_type?.trim()?.toLowerCase();

    if (userRole === "super admin") {
        const allowedSuperAdminPaths = [
            "/settings",
            "/partner-management",
            "/partner-management/settings"
        ];

        if (
            allowedSuperAdminPaths.includes(location.pathname) ||
            location.pathname.startsWith("/settings/schools/")
        ) {
            return children;
        }

        return <Navigate to="/settings" replace />;
    }

    if (allowedRoles?.length) {
        const normalizedRoles = allowedRoles
            .filter(Boolean)
            .map(normalizeRole);

        if (!userRole || !normalizedRoles.includes(userRole)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    if (allowedAdminTypes?.length && userRole === "admin") {
        const normalizedAdminTypes = allowedAdminTypes
            .filter(Boolean)
            .map(type => type.trim().toLowerCase());

        if (!userAdminType || !normalizedAdminTypes.includes(userAdminType)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;