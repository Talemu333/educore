import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deactivateTeacher } from "@/api/teacherApi";

export function useDeactivateTeacher() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: deactivateTeacher,

        onSuccess: () => {

            toast.success(

                "Teacher deactivated successfully."

            );

            queryClient.invalidateQueries({

                queryKey: ["teachers"]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to deactivate teacher."

            );

        }

    });

}