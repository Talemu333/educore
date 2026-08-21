import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTeacherAssignment } from "@/api/teacherAssignmentApi";

import toast from "react-hot-toast";

export function useCreateTeacherAssignment() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createTeacherAssignment,

        onSuccess: (_, variables) => {

            toast.success("Assignment created.");

            queryClient.invalidateQueries({

                queryKey: [

                    "teacherAssignments",

                    variables.teacher_id

                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                error.response?.data?.error ||

                "Failed to create assignment."

            );

        }

    });

}