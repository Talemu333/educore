import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createTeacher } from "@/api/teacherApi";

export function useCreateTeacher() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createTeacher,

        onSuccess: () => {

            toast.success(

                "Teacher created successfully."

            );

            queryClient.invalidateQueries({

                queryKey: ["teachers"]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to create teacher."

            );

        }

    });

}