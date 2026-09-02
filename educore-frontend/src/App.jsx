import { useEffect, useState } from "react";

import AppRouter from "./routes/AppRouter";
import SchoolWebsiteRouter from "./routes/SchoolWebsiteRouter";
import LegacyWebsiteRedirect from "./routes/LegacyWebsiteRedirect";
import EduCoreLandingPage from "./pages/public/EduCoreLandingPage";

const RESERVED_PUBLIC_PREFIXES = new Set([
    "dashboard", "students", "teachers", "parents",
    "attendance", "results", "timetable", "payments", "announcements",
    "settings", "administrators", "student-promotion", "promotion-history",
    "class-subjects", "admin", "login", "website", "change-password",
    "logout"
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

    const isSchoolWebsite =
        firstSegment &&
        !RESERVED_PUBLIC_PREFIXES.has(firstSegment);

    return isSchoolWebsite
        ? <SchoolWebsiteRouter />
        : <AppRouter />;
}

export default App;
