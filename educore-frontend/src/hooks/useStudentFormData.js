import { useQuery } from "@tanstack/react-query";

import { getClasses } from "../services/classService";
import { getStates } from "../services/stateService";
import { getNationalities } from "../services/nationalityService";
import { getArms } from "../services/armService";
import { getSessions } from "../services/sessionService";

export function useStudentFormData() {

    return useQuery({

        queryKey: ["student-form-data"],

        queryFn: async () => {

            const [

                sessions,

                classes,

                states,

                nationalities,

                arms

            ] = await Promise.all([

                getSessions(),

                getClasses(),

                getStates(),

                getNationalities(),

                getArms()

            ]);

            return {

                sessions,

                classes,

                states,

                nationalities,

                arms

            };

        }

    });

}