import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    setCurrentSession
} from "@/api/sessionApi";


export const useSetCurrentSession = () => {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            setCurrentSession,


        onSuccess: () => {

            /*
            =========================================
            REFRESH SESSIONS
            =========================================
            */

            queryClient.invalidateQueries({

                queryKey: [
                    "sessions"
                ]

            });


            /*
            =========================================
            REFRESH SCHOOL SETTINGS
            =========================================
            */

            queryClient.invalidateQueries({

                queryKey: [
                    "school-settings"
                ]

            });

        }

    });

};