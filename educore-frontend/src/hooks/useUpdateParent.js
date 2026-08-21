import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateParent } from "@/api/parentApi";

export function useUpdateParent() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) =>

            updateParent(id, data),

        onSuccess: (_, variables) => {

            toast.success("Parent updated successfully.");

            queryClient.invalidateQueries({

                queryKey: [

                    "student-parents",

                    variables.data.student_id

                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to update parent."

            );

        }

    });

}