import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "@/context/AuthContext";


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


    const userRole = user?.role_name?.trim()?.toLowerCase();
    const userAdminType = user?.admin_type?.trim()?.toLowerCase();


    /*
    =========================================
    SUPER ADMIN
    =========================================

    Super Admin is a platform-level user. The
    normal school routes remain unavailable,
    but the Super Admin may enter the dedicated
    management page for a selected school.
    =========================================
    */
    if (userRole === "super admin") {
        if (
            location.pathname === "/settings" ||
            location.pathname.startsWith("/settings/schools/")
        ) {
            return children;
        }

        return <Navigate to="/settings" replace />;
    }


    if (allowedRoles?.length) {
        const normalizedRoles = allowedRoles
            .filter(Boolean)
            .map(role => role.trim().toLowerCase());

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
