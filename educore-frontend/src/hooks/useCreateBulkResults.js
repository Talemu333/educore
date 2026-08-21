import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { createBulkResults } from "@/services/resultService";

export function useCreateBulkResults() {

    return useMutation({

        mutationFn: createBulkResults,

        onSuccess: () => {

            toast.success(

                "Results uploaded successfully."

            );

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to upload results."

            );

        }

    });

}