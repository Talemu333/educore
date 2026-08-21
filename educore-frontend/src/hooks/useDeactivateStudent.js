import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateStudent } from "../services/studentService";

export function useDeactivateStudent() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: deactivateStudent,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: ["students"]

            });

        }

    });

}