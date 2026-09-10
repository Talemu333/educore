import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import { useEffect } from "react";

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

const PUBLIC_SCHOOL_STORAGE_KEY = "educore_public_school_slug";

function SchoolLayoutBridge({
    isCustomDomain = false,
    schoolSlug: providedSchoolSlug = ""
}) {
    const { schoolSlug: routeSchoolSlug } = useParams();
    const schoolSlug = providedSchoolSlug || routeSchoolSlug;

    useEffect(() => {
        if (!schoolSlug) return;
        sessionStorage.setItem(PUBLIC_SCHOOL_STORAGE_KEY, schoolSlug);
        localStorage.setItem(PUBLIC_SCHOOL_STORAGE_KEY, schoolSlug);
    }, [schoolSlug]);

    if (!isCustomDomain && !schoolSlug) {
        return <Navigate to="/" replace />;
    }

    return <PublicLayout />;
}

function LegacyWebsiteRedirect({
    isCustomDomain = false,
    isSubdomain = false
}) {
    const location = useLocation();

    useEffect(() => {
        const suffix = location.pathname.replace(/^\/website/, "");

        // On an EduProw subdomain or a custom school domain, the hostname
        // already identifies the school. Public website pages therefore live
        // directly at the root: /about, /news, /events, etc.
        if (isSubdomain || isCustomDomain) {
            const target = `${suffix || "/"}${location.search}${location.hash}`;

            if (target !== `${location.pathname}${location.search}${location.hash}`) {
                window.history.replaceState({}, "", target);
                window.dispatchEvent(new PopStateEvent("popstate"));
            }

            return;
        }

        // Legacy path-based school websites keep the school slug in the URL.
        const storedSlug =
            sessionStorage.getItem(PUBLIC_SCHOOL_STORAGE_KEY) ||
            localStorage.getItem(PUBLIC_SCHOOL_STORAGE_KEY);

        if (!storedSlug) {
            window.history.replaceState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
            return;
        }

        const target = `/${storedSlug}${suffix || ""}${location.search}${location.hash}`;
        window.history.replaceState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, [
        location.pathname,
        location.search,
        location.hash,
        isSubdomain,
        isCustomDomain
    ]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
            <p className="text-sm text-slate-500">Opening school website...</p>
        </div>
    );
}

function SubdomainSchoolPrefixRedirect({ schoolSlug }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { schoolSlug: pathSlug } = useParams();

    useEffect(() => {
        if (!schoolSlug || pathSlug !== schoolSlug) return;

        const prefix = `/${schoolSlug}`;
        const suffix = location.pathname.slice(prefix.length) || "/";
        const target = `${suffix}${location.search}${location.hash}`;

        if (
            location.pathname === prefix ||
            location.pathname.startsWith(`${prefix}/`)
        ) {
            navigate(target, { replace: true });
        }
    }, [
        schoolSlug,
        pathSlug,
        location.pathname,
        location.search,
        location.hash,
        navigate
    ]);

    if (pathSlug !== schoolSlug) {
        return <Navigate to="/" replace />;
    }

    return null;
}

export default function SchoolWebsiteRouter({
    isCustomDomain = false,
    isSubdomain = false,
    schoolSlug = ""
}) {
    return (
        <BrowserRouter>
            <Routes>
                {isCustomDomain || isSubdomain ? (
                    <Route
                        element={
                            <SchoolLayoutBridge
                                isCustomDomain={isCustomDomain}
                                schoolSlug={schoolSlug}
                            />
                        }
                    >
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
                ) : (
                    <Route path="/:schoolSlug" element={<SchoolLayoutBridge />}>
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
                )}

                {isSubdomain && (
                    <Route
                        path="/:schoolSlug/*"
                        element={<SubdomainSchoolPrefixRedirect schoolSlug={schoolSlug} />}
                    />
                )}

                <Route
                    path="/website/*"
                    element={
                        <LegacyWebsiteRedirect
                            isSubdomain={isSubdomain}
                            isCustomDomain={isCustomDomain}
                        />
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
