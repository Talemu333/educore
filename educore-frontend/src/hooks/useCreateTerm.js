import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTerm } from "@/services/termService";

export const useCreateTerm = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTerm,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["terms"]
            });
        }
    });
};
