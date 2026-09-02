import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "@/api/axios";

export default function LegacyWebsiteRedirect() {
    const location = useLocation();
    const [target, setTarget] = useState(null);

    useEffect(() => {
        let active = true;

        const redirect = async () => {
            const storedSlug = sessionStorage.getItem("educore_public_school_slug");
            const suffix = location.pathname.replace(/^\/website/, "");

            if (storedSlug) {
                if (active) {
                    setTarget(`/${storedSlug}${suffix || ""}${location.search}${location.hash}`);
                }
                return;
            }

            try {
                const response = await api.get("/school-settings");
                const slug = response?.data?.data?.website_slug;

                if (slug) {
                    sessionStorage.setItem("educore_public_school_slug", slug);
                    if (active) {
                        setTarget(`/${slug}${suffix || ""}${location.search}${location.hash}`);
                    }
                    return;
                }
            } catch {
                // The legacy URL has no school context when opened publicly.
            }

            if (active) setTarget("/educore");
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
