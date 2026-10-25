import { useEffect } from "react";

import {

    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue

} from "@/components/ui/select";

import {

    useMyAssignments

} from "@/hooks/useMyAssignments";

import {

    useAllTeacherAssignments

} from "@/hooks/useAllTeacherAssignments";

import {

    useAuth

} from "@/context/AuthContext";
import ROLES from "@/constants/roles";


function AssignmentSelector({

    value,

    onChange

}) {

    const {

        user

    } = useAuth();


   const isAdmin =  user?.role_name?.toLowerCase() === "admin";


    const {

        data: teacherAssignmentData,

        isLoading: isTeacherLoading

    } = useMyAssignments({

        enabled: Boolean(user) && !isAdmin

    });


    const {

        data: adminAssignmentData,

        isLoading: isAdminLoading

    } = useAllTeacherAssignments({

        enabled: Boolean(user) && isAdmin

    });


    const assignmentData =
        isAdmin

            ? adminAssignmentData

            : teacherAssignmentData;


    const assignments =
        assignmentData?.assignments ?? [];


    const isLoading =
        isAdmin

            ? isAdminLoading

            : isTeacherLoading;

    const hasSingleTeacherAssignment =
        !isAdmin && !isLoading && assignments.length === 1;

    useEffect(() => {
        if (!hasSingleTeacherAssignment) return;

        const onlyAssignment = assignments[0];
        if (Number(value?.id) !== Number(onlyAssignment.id)) {
            onChange(onlyAssignment);
        }
    }, [hasSingleTeacherAssignment, assignments, value?.id, onChange]);

    if (hasSingleTeacherAssignment) {
        const assignment = assignments[0];
        return (
            <div className="w-full max-w-xl rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your assigned result class
                </p>
                <p className="mt-1 font-semibold">
                    {assignment.subject_name} • {assignment.class_name}{assignment.arm_name ? ` ${assignment.arm_name}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {assignment.term_name} • {assignment.session_name}
                </p>
            </div>
        );
    }
    const selectedAssignmentLabel =

        value

            ? `${value.subject_name} • ${value.class_name}${
                value.arm_name
                    ? ` ${value.arm_name}`
                    : ""
            } • ${value.term_name} • ${value.session_name}`

            : "";

    return (

        <Select

            value={
                value?.id?.toString() || ""
            }

            onValueChange={(selectedId) => {

                const assignment =
                    assignments.find(

                        item =>

                            Number(item.id) ===
                            Number(selectedId)

                    );

                onChange(assignment);

            }}

            disabled={isLoading}

        >

            <SelectTrigger
                className="w-full max-w-xl"
            >

                {

                    value

                        ? (

                            <span className="truncate">

                                {
                                    selectedAssignmentLabel
                                }

                            </span>

                        )

                        : (

                            <SelectValue

                                placeholder={

                                    isLoading

                                        ? "Loading assignments..."

                                        : "Select Assignment"

                                }

                            />

                        )

                }

            </SelectTrigger>


            <SelectContent

                side="bottom"

                align="start"

                sideOffset={6}

                alignItemWithTrigger={false}

                className="
                    z-[9999]
                    min-w-[550px]
                "

            >

                {

                    assignments.map(

                        assignment => (

                            <SelectItem

                                key={
                                    assignment.id
                                }

                                value={
                                    String(
                                        assignment.id
                                    )
                                }

                            >

                                <div
                                    className="
                                        flex
                                        flex-col
                                    "
                                >

                                    <span
                                        className="
                                            font-medium
                                        "
                                    >

                                        {
                                            assignment
                                                .subject_name
                                        }

                                    </span>


                                    <span
                                        className="
                                            text-xs
                                            text-muted-foreground
                                        "
                                    >

                                        {

                                            assignment
                                                .class_name

                                        }

                                        {

                                            assignment.arm_name

                                                ? ` - ${assignment.arm_name}`

                                                : ""

                                        }

                                        {" • "}

                                        {

                                            assignment
                                                .term_name

                                        }

                                        {" • "}

                                        {

                                            assignment
                                                .session_name

                                        }


                                        {

                                            isAdmin && (

                                                <>
                                                    {" • "}

                                                    {

                                                        assignment
                                                            .teacher_name

                                                    }
                                                </>

                                            )

                                        }

                                    </span>

                                </div>

                            </SelectItem>

                        )

                    )

                }


                {

                    !isLoading &&

                    assignments.length === 0 && (

                        <div
                            className="
                                px-3
                                py-4
                                text-sm
                                text-muted-foreground
                            "
                        >

                            No assignments found.

                        </div>

                    )

                }

            </SelectContent>

        </Select>

    );

}


export default AssignmentSelector;