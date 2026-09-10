import {
    useQuery
} from "@tanstack/react-query";

import {
    getSchoolSettings
} from "@/api/schoolSettingsApi";


const getPublicSchoolIdentifier = () => {
    const firstSegment =
        window.location.pathname
            .split("/")
            .filter(Boolean)[0] || "";

    const hostname =
        window.location.hostname.toLowerCase();

    const isEduProwDomain = [
        "eduprow.com",
        "www.eduprow.com"
    ].includes(hostname);

    const isEduProwSubdomain =
        hostname.endsWith(".eduprow.com") &&
        !isEduProwDomain;

    const isCustomSchoolDomain =
        !isEduProwDomain &&
        !isEduProwSubdomain &&
        !["localhost", "127.0.0.1"].includes(hostname) &&
        !hostname.endsWith(".vercel.app");

    if (isEduProwSubdomain || isCustomSchoolDomain) {
        return hostname;
    }

    if (!firstSegment || firstSegment === "website") {
        return "";
    }

    return firstSegment;
};


export function useSchoolSettings() {

    const schoolIdentifier =
        getPublicSchoolIdentifier();

    return useQuery({

        queryKey: [
            "schoolSettings",
            schoolIdentifier
        ],

        queryFn:
            getSchoolSettings,

        enabled:
            !!schoolIdentifier

    });

}