import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { linkParent } from "@/api/parentApi";

export function useLinkParent() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: linkParent,

        onSuccess: (_, variables) => {

            toast.success("Parent linked successfully.");

            queryClient.invalidateQueries({

                queryKey: [

                    "student-parents",

                    variables.student_id

                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to link parent."

            );

        }

    });

}