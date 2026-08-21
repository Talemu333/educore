import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useTeachers } from "@/hooks/useTeachers";
import { BookOpen } from "lucide-react";

import {

    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow

} from "@/components/ui/table";

import {

    Eye,
    Pencil,
    Trash2

} from "lucide-react";

import { useDeactivateTeacher } from "@/hooks/useDeactivateTeacher";

function TeacherTable({

    search,

    departmentFilter,

    statusFilter,

    onEdit,

    onView,

    onAssign

}) {

    const {

        data: teachers = [],

        isLoading: loading,

        error

    } = useTeachers();

    // console.log(teachers);

    const filteredTeachers = teachers.filter((teacher) => {

        const keyword = search.toLowerCase();

        const matchesSearch =

            teacher.staff_number
                ?.toLowerCase()
                .includes(keyword)

            ||

            teacher.full_name
                ?.toLowerCase()
                .includes(keyword)

            ||

            teacher.phone_number
                ?.includes(search);

        const matchesDepartment =

            !departmentFilter ||

            teacher.department_id?.toString() === departmentFilter;

        const matchesStatus =
            !statusFilter ||
            teacher.status === (statusFilter === "true"
                    ? "Active"
                    : "Inactive");

        return (

            matchesSearch &&

            matchesDepartment &&

            matchesStatus

        );

    });

    const deactivateTeacherMutation = useDeactivateTeacher();

    if (loading) {

        return <p>Loading teachers...</p>;

    }

    if (error) {

        return <p>Failed to load teachers.</p>;

    }

    if (filteredTeachers.length === 0) {

        return (

            <p className="text-center text-muted-foreground py-10">

                No teachers found.

            </p>

        );

    }

    return (

        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>

                        Staff No.

                    </TableHead>

                    <TableHead>

                        Name

                    </TableHead>

                    <TableHead>

                        Department

                    </TableHead>

                    <TableHead>

                        Qualification

                    </TableHead>

                    <TableHead>

                        Phone

                    </TableHead>

                    <TableHead>

                        Status

                    </TableHead>

                    <TableHead className="text-right">

                        Actions

                    </TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {

                    filteredTeachers.map((teacher) => (

                        <TableRow key={teacher.id}>

                            <TableCell>

                                {teacher.staff_number}

                            </TableCell>

                            <TableCell>

                                {teacher.full_name}

                            </TableCell>

                            <TableCell>

                                {teacher.department_name || "-"}

                            </TableCell>

                            <TableCell>

                                {teacher.qualification_name || "-"}

                            </TableCell>

                            <TableCell>

                                {teacher.phone_number}

                            </TableCell>

                            <TableCell>

                                {

                                    teacher.status ? (

                                        <Badge>

                                            Active

                                        </Badge>

                                    ) : (

                                        <Badge variant="secondary">

                                            Inactive

                                        </Badge>

                                    )

                                }

                            </TableCell>

                            <TableCell className="text-right">

                                <div className="flex justify-end gap-2">

                                    <Button

                                        size="icon"

                                        variant="outline"

                                        onClick={() =>

                                            onView?.(teacher)

                                        }

                                    >

                                        <Eye className="h-4 w-4" />

                                    </Button>

                                    <Button

                                        size="icon"

                                        variant="outline"

                                        onClick={() =>

                                            onEdit(teacher)

                                        }

                                    >

                                        <Pencil className="h-4 w-4" />

                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={() => onAssign?.(teacher)}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                    </Button>

                                    <Button

                                        size="icon"

                                        variant="destructive"

                                        onClick={() => {

                                            const confirmed =

                                                window.confirm(

                                                    `Deactivate ${teacher.full_name}?`

                                                );

                                            if (!confirmed) return;

                                            deactivateTeacherMutation.mutate(

                                                teacher.id

                                            );

                                        }}

                                    >

                                        <Trash2 className="h-4 w-4" />

                                    </Button>

                                </div>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>

        </Table>

    );

}

export default TeacherTable;