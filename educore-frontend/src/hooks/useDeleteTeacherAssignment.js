import {

    useMutation,

    useQueryClient

} from "@tanstack/react-query";

import {

    deleteTeacherAssignment

} from "@/api/teacherAssignmentApi";

import toast from "react-hot-toast";

export function useDeleteTeacherAssignment() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn: deleteTeacherAssignment,

        onSuccess: () => {

            toast.success(

                "Assignment deleted."

            );

            queryClient.invalidateQueries({

                queryKey: [

                    "teacherAssignments"

                ]

            });

        }

    });

}