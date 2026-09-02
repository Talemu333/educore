import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import api from "@/api/axios";
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

function SchoolLayoutBridge() {
    const { schoolSlug } = useParams();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!schoolSlug) return;

        // Public website queries are currently shared by page type. Clear
        // them whenever the tenant changes so School B cannot momentarily
        // display School A's cached public content.
        const publicQueryKeys = [
            ["website-pages"],
            ["website-page"],
            ["website-news"],
            ["website-events"],
            ["website-event"],
            ["website-gallery"],
            ["schoolSettings"]
        ];

        publicQueryKeys.forEach(queryKey => {
            queryClient.removeQueries({ queryKey });
        });
    }, [schoolSlug, queryClient]);

    if (!schoolSlug) return <Navigate to="/" replace />;

    sessionStorage.setItem("educore_public_school_slug", schoolSlug);
    return <PublicLayout />;
}

function LegacyWebsiteRedirect() {
    const location = useLocation();
    const [target, setTarget] = useState(null);

    useEffect(() => {
        let active = true;

        const redirect = async () => {
            const storedSlug = sessionStorage.getItem("educore_public_school_slug");

            if (storedSlug) {
                const suffix = location.pathname.replace(/^\/website/, "");
                if (active) setTarget(`/${storedSlug}${suffix || ""}${location.search}${location.hash}`);
                return;
            }

            try {
                const response = await api.get("/school-settings");
                const slug = response?.data?.data?.website_slug;

                if (slug) {
                    sessionStorage.setItem("educore_public_school_slug", slug);
                    const suffix = location.pathname.replace(/^\/website/, "");
                    if (active) setTarget(`/${slug}${suffix || ""}${location.search}${location.hash}`);
                    return;
                }
            } catch {
                // The legacy URL has no school context when opened publicly.
            }

            if (active) setTarget("/");
        };

        redirect();

        return () => {
            active = false;
        };
    }, [location.pathname, location.search, location.hash]);

    if (!target) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-6">
                <p className="text-sm text-slate-500">Opening school website...</p>
            </div>
        );
    }

    return <Navigate to={target} replace />;
}

function SchoolWebsiteNavigationBridge() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClick = (event) => {
            const anchor = event.target.closest("a");

            if (!anchor) return;

            const href = anchor.getAttribute("href");

            if (!href || !href.startsWith("/website")) return;

            const firstSegment = location.pathname
                .split("/")
                .filter(Boolean)[0];

            if (!firstSegment || firstSegment === "website") return;

            const suffix = href.replace(/^\/website/, "");
            const nextPath = `/${firstSegment}${suffix || ""}`;

            event.preventDefault();
            event.stopPropagation();
            navigate(nextPath);
        };

        // Capture phase is intentional. Most existing public-page components
        // still contain legacy /website links, and React Router's delegated
        // click handler would otherwise navigate before the bridge sees them.
        document.addEventListener("click", handleClick, true);

        return () => {
            document.removeEventListener("click", handleClick, true);
        };
    }, [location.pathname, navigate]);

    return null;
}

export default function SchoolWebsiteRouter() {
    return (
        <BrowserRouter>
            <SchoolWebsiteNavigationBridge />

            <Routes>
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

                <Route path="/website/*" element={<LegacyWebsiteRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
