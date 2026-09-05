import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRouter from "./routes/AppRouter";
import SchoolWebsiteRouter from "./routes/SchoolWebsiteRouter";
import LegacyWebsiteRedirect from "./routes/LegacyWebsiteRedirect";
import EduCoreLandingPage from "./pages/public/EduCoreLandingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ContactMessagesPage from "./pages/dashboard/ContactMessagesPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import StudentDashboardPage from "./pages/students/StudentDashboardPage";

const RESERVED_PUBLIC_PREFIXES = new Set([
    "dashboard",
    "students",
    "teachers",
    "parents",
    "attendance",
    "results",
    "timetable",
    "payments",
    "announcements",
    "settings",
    "administrators",
    "student-promotion",
    "promotion-history",
    "class-subjects",
    "admin",
    "login",
    "website",
    "change-password",
    "logout",
    "contact-messages",
    "expenses",
    "parent-overview",
    "parent",
    "parent-dashboard",
    "parent-results",
    "parent-attendance",
    "teacher-dashboard",
    "teacher-students",
    "forgot-password",
    "reset-password",
    "student-dashboard",
    "student-cbt",
    "student-results",
    "student-subjects"
]);

function useAppPathname() {
    const [pathname, setPathname] = useState(() => window.location.pathname);

    useEffect(() => {
        const updatePathname = () => {
            setPathname(window.location.pathname);
        };

        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args) {
            originalPushState.apply(this, args);
            updatePathname();
        };

        window.history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            updatePathname();
        };

        window.addEventListener("popstate", updatePathname);

        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener("popstate", updatePathname);
        };
    }, []);

    return pathname;
}

function App() {
    const pathname = useAppPathname();

    const firstSegment = pathname
        .split("/")
        .filter(Boolean)[0] || "";

    if (pathname === "/educore") {
        return <EduCoreLandingPage />;
    }

    if (firstSegment === "website") {
        return <LegacyWebsiteRedirect />;
    }

    if (pathname === "/forgot-password") {
        return (
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );
    }

    if (pathname === "/reset-password") {
        return (
            <BrowserRouter>
                <ResetPasswordPage />
            </BrowserRouter>
        );
    }

    if (pathname === "/change-password") {
        return (
            <BrowserRouter>
                <ProtectedRoute
                    allowedRoles={["Admin", "Teacher", "Parent", "Student"]}
                >
                    <DashboardLayout>
                        <ChangePasswordPage />
                    </DashboardLayout>
                </ProtectedRoute>
            </BrowserRouter>
        );
    }

    if (pathname === "/student-dashboard") {
        return (
            <BrowserRouter>
                <ProtectedRoute allowedRoles={["Student"]}>
                    <DashboardLayout>
                        <StudentDashboardPage />
                    </DashboardLayout>
                </ProtectedRoute>
            </BrowserRouter>
        );
    }

    if (pathname === "/contact-messages") {
        return (
            <BrowserRouter>
                <ProtectedRoute
                    allowedRoles={["Admin"]}
                    allowedAdminTypes={["proprietor", "principal"]}
                >
                    <DashboardLayout>
                        <ContactMessagesPage />
                    </DashboardLayout>
                </ProtectedRoute>
            </BrowserRouter>
        );
    }

    if (pathname === "/expenses") {
        return (
            <BrowserRouter>
                <ProtectedRoute
                    allowedRoles={["Admin"]}
                    allowedAdminTypes={["proprietor", "principal", "bursar"]}
                >
                    <DashboardLayout>
                        <ExpensesPage />
                    </DashboardLayout>
                </ProtectedRoute>
            </BrowserRouter>
        );
    }

    const isSchoolWebsite =
        firstSegment &&
        !RESERVED_PUBLIC_PREFIXES.has(firstSegment);

    return isSchoolWebsite
        ? <SchoolWebsiteRouter />
        : <AppRouter />;
}

export default App;
