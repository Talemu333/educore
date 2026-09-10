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

function SchoolLayoutBridge({ isCustomDomain = false, isSubdomain = false, schoolSlug: providedSchoolSlug = "" }) {
    const { schoolSlug: routeSchoolSlug } = useParams();
    const schoolSlug = providedSchoolSlug || routeSchoolSlug;

    useEffect(() => {
        if (!schoolSlug) return;
        sessionStorage.setItem(PUBLIC_SCHOOL_STORAGE_KEY, schoolSlug);
        localStorage.setItem(PUBLIC_SCHOOL_STORAGE_KEY, schoolSlug);
    }, [schoolSlug]);

    if (!isCustomDomain && !schoolSlug) return <Navigate to="/" replace />;

    return (
        <>
            <SchoolWebsiteNavigationBridge isCustomDomain={isCustomDomain} schoolSlug={schoolSlug} />
            <PublicLayout />
        </>
    );
}

function LegacyWebsiteRedirect() {
    const location = useLocation();

    useEffect(() => {
        const storedSlug = sessionStorage.getItem(PUBLIC_SCHOOL_STORAGE_KEY) || localStorage.getItem(PUBLIC_SCHOOL_STORAGE_KEY);
        if (!storedSlug) {
            window.history.replaceState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
            return;
        }
        const suffix = location.pathname.replace(/^\/website/, "");
        const target = `/${storedSlug}${suffix || ""}${location.search}${location.hash}`;
        window.history.replaceState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, [location.pathname, location.search, location.hash]);

    return <div className="flex min-h-screen items-center justify-center bg-white px-6"><p className="text-sm text-slate-500">Opening school website...</p></div>;
}

function SchoolWebsiteNavigationBridge({ isCustomDomain = false, schoolSlug = "" }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!schoolSlug && !isCustomDomain) return;

        const toSchoolPath = href => {
            if (!href || !href.startsWith("/website")) return href;
            const suffix = href.replace(/^\/website/, "");
            return isCustomDomain ? (suffix || "/") : `/${schoolSlug}${suffix || ""}`;
        };

        const rewriteLinks = () => {
            document.querySelectorAll('a[href^="/website"]').forEach(anchor => {
                const href = anchor.getAttribute("href");
                const nextHref = toSchoolPath(href);
                if (nextHref && nextHref !== href) anchor.setAttribute("href", nextHref);
            });
        };

        rewriteLinks();
        const observer = new MutationObserver(rewriteLinks);
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });

        const handleClick = event => {
            const anchor = event.target.closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || !href.startsWith("/website")) return;
            event.preventDefault();
            event.stopPropagation();
            navigate(toSchoolPath(href));
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            observer.disconnect();
            document.removeEventListener("click", handleClick, true);
        };
    }, [schoolSlug, isCustomDomain, navigate, location.pathname]);

    return null;
}

export default function SchoolWebsiteRouter({ isCustomDomain = false, isSubdomain = false, schoolSlug = "" }) {
    return (
        <BrowserRouter>
            <Routes>
                {isCustomDomain || isSubdomain ? (
                    <Route
                        path="*"
                        element={
                            <SchoolLayoutBridge
                                isCustomDomain={isCustomDomain}
                                isSubdomain={isSubdomain}
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
                <Route path="/website/*" element={<LegacyWebsiteRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
