import {
    useQuery
} from "@tanstack/react-query";

import {
    getSchoolSettings
} from "@/api/schoolSettingsApi";


const getPublicSchoolSlug = () =>
    window.location.pathname
        .split("/")
        .filter(Boolean)[0] || "";


export function useSchoolSettings() {

    const schoolSlug =
        getPublicSchoolSlug();

    return useQuery({

        queryKey: [
            "schoolSettings",
            schoolSlug
        ],

        queryFn:
            getSchoolSettings,

        enabled:
            !!schoolSlug

    });

}