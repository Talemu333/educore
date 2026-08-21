import { useQuery } from "@tanstack/react-query";

import {
    getAllTeacherAssignments
} from "@/api/teacherAssignmentApi";


export function useAllTeacherAssignments(
    options = {}
) {

    const {
        enabled = true
    } = options;


    return useQuery({

        queryKey: [
            "allTeacherAssignments"
        ],

        queryFn:
            getAllTeacherAssignments,

        enabled

    });

}