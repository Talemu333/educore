import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveClassSubjects } from "@/api/classSubjectApi";

import toast from "react-hot-toast";

export function useSaveClassSubjects() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: saveClassSubjects,

        onSuccess: (_, variables) => {

            toast.success(

                "Subjects saved successfully."

            );

            queryClient.invalidateQueries({

                queryKey: [

                    "classSubjects",

                    variables.class_id

                ]

            });

        }

    });

}