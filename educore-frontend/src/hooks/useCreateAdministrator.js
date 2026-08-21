import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    createAdministrator
} from "@/api/adminApi";


export const useCreateAdministrator = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            createAdministrator,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "administrators"
                ]

            });

        }

    });

};