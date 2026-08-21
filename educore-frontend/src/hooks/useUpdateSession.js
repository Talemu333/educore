import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    updateSession
} from "@/services/sessionService";


export const useUpdateSession = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn: ({
            id,
            data
        }) =>
            updateSession(
                id,
                data
            ),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["sessions"]
            });

        }

    });

};