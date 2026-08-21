import { useQuery } from "@tanstack/react-query";

import {
    getParentDashboard
} from "@/api/parentApi";


export function useParentDashboard() {

    return useQuery({

        queryKey: [
            "parent-dashboard"
        ],

        queryFn:
            getParentDashboard,

        staleTime:
            5 * 60 * 1000

    });

}