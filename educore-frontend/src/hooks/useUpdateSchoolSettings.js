import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    updateSchoolSettings
} from "@/api/schoolSettingsApi";


export function useUpdateSchoolSettings() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            updateSchoolSettings,


        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "schoolSettings"
                ]

            });

        }

    });

}