import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateTeacher } from "@/api/teacherApi";

export function useUpdateTeacher() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) =>

            updateTeacher(id, data),

        onSuccess: () => {

            toast.success(

                "Teacher updated successfully."

            );

            queryClient.invalidateQueries({

                queryKey: ["teachers"]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to update teacher."

            );

        }

    });

}