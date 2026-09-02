import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useParams
} from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Academics from "@/pages/public/Academics";
import Admissions from "@/pages/public/Admissions";
import Gallery from "@/pages/public/Gallery";
import News from "@/pages/public/News";
import NewsDetails from "@/pages/public/NewsDetails";
import Events from "@/pages/public/Events";
import EventDetails from "@/pages/public/EventDetails";

const RESERVED_PREFIXES = new Set([
    "website", "dashboard", "students", "teachers", "parents",
    "attendance", "results", "timetable", "payments", "announcements",
    "settings", "administrators", "student-promotion", "promotion-history",
    "class-subjects", "admin", "login"
]);

function SchoolRouteBridge() {
    const { schoolSlug } = useParams();
    const location = useLocation();

    if (!schoolSlug || RESERVED_PREFIXES.has(schoolSlug)) {
        return <Navigate to="/" replace />;
    }

    sessionStorage.setItem("educore_public_school_slug", schoolSlug);

    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="academics" element={<Academics />} />
                <Route path="admissions" element={<Admissions />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="news" element={<News />} />
                <Route path="news/:slug" element={<NewsDetails />} />
                <Route path="events" element={<Events />} />
                <Route path="events/:slug" element={<EventDetails />} />
            </Route>
        </Routes>
    );
}

function LegacyWebsiteRedirect() {
    const location = useLocation();
    const schoolSlug = sessionStorage.getItem("educore_public_school_slug");

    if (!schoolSlug) {
        return <Navigate to="/" replace />;
    }

    const suffix = location.pathname.replace(/^\/website/, "");
    return <Navigate to={`/${schoolSlug}${suffix || ""}${location.search}`} replace />;
}

export default function SchoolWebsiteRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/:schoolSlug/*" element={<SchoolRouteBridge />} />
                <Route path="/website/*" element={<LegacyWebsiteRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
