import { useQuery } from "@tanstack/react-query";
import { getSchoolSettings } from "@/api/schoolSettingsApi";

const getPublicSchoolIdentifier = () => {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    const hostname = window.location.hostname.toLowerCase();
    const isEduProwDomain = ["eduprow.com", "www.eduprow.com"].includes(hostname);
    const isEduProwSubdomain = hostname.endsWith(".eduprow.com") && !isEduProwDomain;
    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    if (isEduProwDomain) return "";
    if (isEduProwSubdomain || isCustomSchoolDomain) return hostname;
    if (!firstSegment || firstSegment === "website") return "";
    return firstSegment;
};

const normalizeSchoolSettings = (settings) => {
    if (!settings) return settings;
    const normalized = { ...settings };
    if (normalized.school_motto === "Excellence • Character • Knowledge") normalized.school_motto = "";
    if (normalized.school_level === "Primary & Secondary School") normalized.school_level = "";
    return normalized;
};

export function useSchoolSettings() {
    const schoolIdentifier = getPublicSchoolIdentifier();

    return useQuery({
        queryKey: ["schoolSettings", schoolIdentifier],
        queryFn: async () => {
            const cacheKey = "eduprow:public-school-settings:v1:" + schoolIdentifier;
            let cachedSettings = null;

            // Public branding is cached per school domain, never shared between tenants.
            try {
                const cached = localStorage.getItem(cacheKey);
                cachedSettings = cached ? JSON.parse(cached) : null;
            } catch {
                cachedSettings = null;
            }

            try {
                const settings = normalizeSchoolSettings(await getSchoolSettings());
                if (settings && typeof settings === "object") {
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(settings));
                    } catch {
                        // Storage may be disabled or full; online mode still works.
                    }
                }
                return settings;
            } catch (error) {
                // On a network failure, use this school's last known public branding.
                if (cachedSettings && typeof cachedSettings === "object") return cachedSettings;
                throw error;
            }
        },
        enabled: !!schoolIdentifier
    });
}
