import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTeacherAssignment } from "@/api/teacherAssignmentApi";

import toast from "react-hot-toast";

export function useUpdateTeacherAssignment() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) =>

            updateTeacherAssignment(id, data),

        onSuccess: (_, variables) => {

            toast.success("Assignment updated.");

            queryClient.invalidateQueries({

                queryKey: [

                    "teacherAssignments",

                    variables.data.teacher_id

                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to update assignment."

            );

        }

    });

}