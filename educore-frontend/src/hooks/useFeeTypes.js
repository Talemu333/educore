import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

import {
    getFeeTypes,
    createFeeType,
    updateFeeType,
    deleteFeeType
} from "@/api/feeTypeApi";


/*
=========================================
GET FEE TYPES
=========================================
*/

export function useFeeTypes() {

    return useQuery({

        queryKey: [
            "fee-types"
        ],

        queryFn:
            getFeeTypes

    });

}


/*
=========================================
CREATE FEE TYPE
=========================================
*/

export function useCreateFeeType() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createFeeType,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "fee-types"
                ]

            });

        }

    });

}


/*
=========================================
UPDATE FEE TYPE
=========================================
*/

export function useUpdateFeeType() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateFeeType(
                    id,
                    data
                ),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "fee-types"
                ]

            });

        }

    });

}


/*
=========================================
DELETE FEE TYPE
=========================================
*/

export function useDeleteFeeType() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            deleteFeeType,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "fee-types"
                ]

            });

        }

    });

}