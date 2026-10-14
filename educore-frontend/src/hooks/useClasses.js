import { useQuery } from "@tanstack/react-query";
import { getClasses } from "@/api/classApi";
import { useAuth } from "@/context/AuthContext";

export function useClasses() {

    const { user } = useAuth();
    const schoolId = user?.school_id;

    return useQuery({

        queryKey: ["classes", schoolId],

        queryFn: getClasses,

        // Keep every class dropdown/list clean even if older records contain duplicates.
        select: (classes = []) => {
            const seen = new Set();
            return classes.filter((schoolClass) => {
                const key = String(schoolClass?.class_name || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLocaleLowerCase();
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        },

        enabled: !!schoolId

    });

}