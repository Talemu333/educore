import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { unlinkParent } from "@/api/parentApi";

export function useUnlinkParent() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ studentId, parentId }) =>

            unlinkParent(studentId, parentId),

        onSuccess: (_, variables) => {

            toast.success("Parent removed.");

            queryClient.invalidateQueries({

                queryKey: [

                    "student-parents",

                    variables.studentId

                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to remove parent."

            );

        }

    });

}