import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    deactivateAdministrator
} from "@/api/adminApi";


export const useDeactivateAdministrator = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            deactivateAdministrator,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "administrators"
                ]

            });

        }

    });

};