import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";

import {
    getFeeStructures,
    createFeeStructure,
    updateFeeStructure
} from "@/api/feeStructureApi";


/*
=========================================
GET FEE STRUCTURES
=========================================
*/

export function useFeeStructures() {

    return useQuery({

        queryKey: [
            "fee-structures"
        ],

        queryFn:
            getFeeStructures

    });

}


/*
=========================================
CREATE FEE STRUCTURE
=========================================
*/

export function useCreateFeeStructure() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createFeeStructure,

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "fee-structures"
                ]

            });

        }

    });

}


/*
=========================================
UPDATE FEE STRUCTURE
=========================================
*/

export function useUpdateFeeStructure() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            ({ id, data }) =>
                updateFeeStructure(
                    id,
                    data
                ),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "fee-structures"
                ]

            });

        }

    });

}