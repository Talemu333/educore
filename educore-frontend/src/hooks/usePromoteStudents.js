import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    promoteStudents
} from "@/api/promotionApi";


export const usePromoteStudents = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            promoteStudents,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "promotion-students"
                ]

            });

        }

    });

};