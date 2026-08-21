import { Button } from "@/components/ui/Button";

import {

    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow

} from "@/components/ui/table";

import {

    Trash2

} from "lucide-react";

import { useDeleteTeacherAssignment } from "@/hooks/useDeleteTeacherAssignment";

function AssignmentTable({

    teacherId,

    assignmentData,

    onEdit

}) {

    const deleteMutation =
        useDeleteTeacherAssignment();

    const assignments =
        assignmentData?.assignments ?? [];

    if (assignments.length === 0) {

        return (

            <div className="text-center py-10 text-muted-foreground">

                This teacher has not been assigned to any class yet.

            </div>

        );

    }

    return (
        
        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>

                        Session

                    </TableHead>

                    <TableHead>

                        Term

                    </TableHead>

                    <TableHead>

                        Class

                    </TableHead>

                    <TableHead>

                        Arm

                    </TableHead>

                    <TableHead>

                        Subject

                    </TableHead>

                    <TableHead>

                        Action

                    </TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {

                    assignments.map((assignment) => (

                        <TableRow

                            key={assignment.id}

                        >

                            <TableCell>

                                {assignment.session_name}

                            </TableCell>

                            <TableCell>

                                {assignment.term_name}

                            </TableCell>

                            <TableCell>

                                {assignment.class_name}

                            </TableCell>

                            <TableCell>

                                {

                                    assignment.arm_name ||

                                    "-"

                                }

                            </TableCell>

                            <TableCell>

                                {assignment.subject_name}

                            </TableCell>

                            <TableCell>

                                <Button

                                    size="icon"

                                    variant="destructive"

                                    onClick={() => {

                                        if (

                                            window.confirm(

                                                "Delete this assignment?"

                                            )

                                        ) {

                                            deleteMutation.mutate(

                                                assignment.id,

                                                {

                                                    onSuccess: () => {

                                                        deleteMutation.queryClient?.invalidateQueries?.();

                                                    }

                                                }

                                            );

                                        }

                                    }}

                                >

                                    <Trash2 className="h-4 w-4" />

                                </Button>

                                <Button

                                    variant="outline"

                                    onClick={() =>

                                        onEdit(assignment)

                                    }

                                >

                                    Edit

                                </Button>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>

        </Table>

    );

}

export default AssignmentTable;