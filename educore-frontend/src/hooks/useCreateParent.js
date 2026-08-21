import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createParent } from "@/api/parentApi";

export function useCreateParent() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createParent,

        onSuccess: (response, variables) => {

            const temporaryPassword =
                response?.data?.temporaryPassword;

            toast.success(
                `Parent created successfully.\n\nUsername: ${variables.username}\nTemporary Password: ${temporaryPassword}`,
                {
                    duration: 10000
                }
            );

            queryClient.invalidateQueries({

                queryKey: [
                    "student-parents",
                    variables.student_id
                ]

            });

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to create parent."

            );

        }

    });

}

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { createParent } from "@/api/parentApi";

// export function useCreateParent() {

//     const queryClient = useQueryClient();

//     return useMutation({

//         mutationFn: createParent,

//         onSuccess: (_, variables) => {

//             toast.success("Parent created successfully.");

//             queryClient.invalidateQueries({

//                 queryKey: ["student-parents", variables.student_id]

//             });

//         },

//         onError: (error) => {

//             toast.error(

//                 error.response?.data?.message ||

//                 "Failed to create parent."

//             );

//         }

//     });

// }

// export const updateParent = async (id, parentData) => {

//     const response = await api.put(

//         `/parents/${id}`,

//         parentData

//     );

//     return response.data;

// };