import {
    Navigate
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


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (
            <h2>
                Loading...
            </h2>
        );

    }


    /*
    =========================================
    NOT AUTHENTICATED
    =========================================
    */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    /*
    =========================================
    USER ROLE
    =========================================
    */

    const userRole =
        user?.role_name
            ?.trim()
            ?.toLowerCase();


    /*
    =========================================
    USER ADMIN TYPE
    =========================================
    */

    const userAdminType =
        user?.admin_type
            ?.trim()
            ?.toLowerCase();


    /*
    =========================================
    CHECK ROLE
    =========================================
    */

    if (allowedRoles?.length) {

        const normalizedRoles =
            allowedRoles
                .filter(Boolean)
                .map(role =>
                    role
                        .trim()
                        .toLowerCase()
                );


        if (
            !userRole ||
            !normalizedRoles.includes(
                userRole
            )
        ) {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );

        }

    }


    /*
    =========================================
    CHECK ADMIN TYPE
    =========================================

    admin_type is relevant only when
    the authenticated user's role is Admin.
    =========================================
    */

    if (
        allowedAdminTypes?.length &&
        userRole === "admin"
    ) {

        const normalizedAdminTypes =
            allowedAdminTypes
                .filter(Boolean)
                .map(type =>
                    type
                        .trim()
                        .toLowerCase()
                );


        if (
            !userAdminType ||
            !normalizedAdminTypes.includes(
                userAdminType
            )
        ) {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );

        }

    }


    /*
    =========================================
    ACCESS GRANTED
    =========================================
    */

    return children;

}


export default ProtectedRoute;