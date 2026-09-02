import AppRouter from "./routes/AppRouter";
import SchoolWebsiteRouter from "./routes/SchoolWebsiteRouter";
import EduCoreLandingPage from "./pages/public/EduCoreLandingPage";

const RESERVED_PUBLIC_PREFIXES = new Set([
    "dashboard", "students", "teachers", "parents",
    "attendance", "results", "timetable", "payments", "announcements",
    "settings", "administrators", "student-promotion", "promotion-history",
    "class-subjects", "admin", "login"
]);

function App() {
    const firstSegment = window.location.pathname
        .split("/")
        .filter(Boolean)[0] || "";

    if (window.location.pathname === "/educore") {
        return <EduCoreLandingPage />;
    }

    const isSchoolWebsite =
        firstSegment &&
        !RESERVED_PUBLIC_PREFIXES.has(firstSegment);

    return isSchoolWebsite
        ? <SchoolWebsiteRouter />
        : <AppRouter />;
}

export default App;
