import {
    useQuery
} from "@tanstack/react-query";

import {
    getSchoolSettings
} from "@/api/schoolSettingsApi";


export function useSchoolSettings() {

    return useQuery({

        queryKey: [
            "schoolSettings"
        ],

        queryFn:
            getSchoolSettings

    });

}