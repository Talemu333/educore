import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    activateAdministrator
} from "@/api/adminApi";


export const useActivateAdministrator = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            activateAdministrator,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "administrators"
                ]

            });

        }

    });

};