import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createSession
} from "@/services/sessionService";


export const useCreateSession = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn: createSession,

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["sessions"]
            });

        }

    });

};