import {
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import {
    createGradingScale,
    updateGradingScale,
    deleteGradingScale
} from "@/api/gradingScaleApi";


export function useCreateGradingScale() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createGradingScale,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "gradingScales"
                ]

            });

        }

    });

}


export function useUpdateGradingScale() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateGradingScale(
                    id,
                    data
                ),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "gradingScales"
                ]

            });

        }

    });

}


export function useDeleteGradingScale() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            deleteGradingScale,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "gradingScales"
                ]

            });

        }

    });

}