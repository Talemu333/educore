import { useEffect, useState } from "react";

export default function LegacyWebsiteRedirect() {
    const [target, setTarget] = useState(null);

    useEffect(() => {
        let active = true;

        const redirect = async () => {
            const pathname = window.location.pathname;
            const suffix = pathname.replace(/^\/website/, "");
            const search = window.location.search;
            const hash = window.location.hash;
            const storedSlug = sessionStorage.getItem("educore_public_school_slug");

            if (storedSlug) {
                if (active) {
                    setTarget(`/${storedSlug}${suffix || ""}${search}${hash}`);
                }
                return;
            }

            try {
                const response = await fetch("/api/school-settings", {
                    credentials: "include"
                });
                const payload = await response.json();
                const slug = payload?.data?.website_slug;

                if (slug) {
                    sessionStorage.setItem("educore_public_school_slug", slug);
                    if (active) {
                        setTarget(`/${slug}${suffix || ""}${search}${hash}`);
                    }
                    return;
                }
            } catch {
                // A legacy URL has no reliable school context when opened publicly.
            }

            if (active) {
                setTarget("/educore");
            }
        };

        redirect();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!target) return;
        window.history.replaceState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, [target]);

    if (!target) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-6">
                <p className="text-sm text-slate-500">Opening school website...</p>
            </div>
        );
    }

    return null;
}
