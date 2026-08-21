import {

    Sheet,

    SheetContent,

    SheetHeader,

    SheetTitle

} from "@/components/ui/sheet";

import { useState} from "react";
import AssignmentForm from "./AssignmentForm";

import AssignmentTable from "./AssignmentTable";

import { useTeacher } from "@/hooks/useTeacher";

import { useTeacherAssignments } from "@/hooks/useTeacherAssignments";

function TeacherAssignmentSheet({

    open,

    onOpenChange,

    teacherId

}) {

    const [editingAssignment, setEditingAssignment] = useState(null);

    const {

        data: teacher,

        isLoading

    } = useTeacher(

        teacherId,

        open

    );

    const {

        data: assignmentData

    } = useTeacherAssignments(

        teacherId

    );

    if (isLoading) {

        return null;

    }

    return (

        <Sheet

            open={open}

            onOpenChange={onOpenChange}

        >

            <SheetContent className="sm:max-w-5xl overflow-y-auto">

                <SheetHeader>

                    <SheetTitle>

                        Teacher Assignment

                    </SheetTitle>

                </SheetHeader>

                <div className="mt-6 space-y-6">

                    <div className="border rounded-lg p-4 bg-muted/40">

                        <h2 className="text-xl font-semibold">

                            {teacher?.surname} {teacher?.first_name}

                        </h2>

                        <p>

                            Staff No: {teacher?.staff_number}

                        </p>

                        <p>

                            Department: {teacher?.department_name}

                        </p>

                        <p className="font-medium mt-2">

                            Total Assignments:

                            {assignmentData?.totalAssignments ?? 0}

                        </p>

                    </div>

                    <AssignmentForm

                        teacherId={teacherId}

                        editingAssignment={editingAssignment}

                        onFinishEditing={() =>

                            setEditingAssignment(null)

                        }

                    />

                    <AssignmentTable

                        teacherId={teacherId}

                        assignmentData={assignmentData}

                        onEdit={setEditingAssignment}

                    />

                </div>

            </SheetContent>

        </Sheet>

    );

}

export default TeacherAssignmentSheet;