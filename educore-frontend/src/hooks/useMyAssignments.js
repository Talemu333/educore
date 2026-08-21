import { useQuery } from "@tanstack/react-query";

import {
    getMyAssignments
} from "@/api/teacherAssignmentApi";


export function useMyAssignments(
    options = {}
) {

    const {
        enabled = true
    } = options;


    return useQuery({

        queryKey: [
            "myAssignments"
        ],

        queryFn:
            getMyAssignments,

        enabled

    });

}