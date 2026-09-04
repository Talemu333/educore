import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/common/Pagination";
import { useTeachers } from "@/hooks/useTeachers";
import { useDeactivateTeacher } from "@/hooks/useDeactivateTeacher";
import { BookOpen, Eye, Pencil, Trash2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

function TeacherTable({
    search,
    departmentFilter,
    statusFilter,
    onEdit,
    onView,
    onAssign
}) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const {
        data,
        isLoading: loading,
        isFetching,
        error
    } = useTeachers({
        search,
        departmentId: departmentFilter,
        status: statusFilter,
        page,
        limit
    });

    const deactivateTeacherMutation = useDeactivateTeacher();
    const teachers = data?.data ?? [];
    const total = Number(data?.total ?? teachers.length);
    const totalPages = Math.max(
        1,
        Number(data?.totalPages ?? Math.ceil(total / limit))
    );

    useEffect(() => {
        setPage(1);
    }, [search, departmentFilter, statusFilter]);

    const handleLimitChange = (event) => {
        setLimit(Number(event.target.value));
        setPage(1);
    };

    if (loading) {
        return <p className="py-10 text-center text-sm text-muted-foreground">Loading teachers...</p>;
    }

    if (error) {
        return <p className="py-10 text-center text-sm text-red-600">Failed to load teachers.</p>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <p className="text-sm text-slate-500">
                    {total} teacher{total === 1 ? "" : "s"} found
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="hidden whitespace-nowrap sm:inline">Rows per page</span>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <Table className="min-w-[980px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                    No teachers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            teachers.map((teacher) => {
                                const active = teacher.status === true || teacher.status === "Active";
                                const processing = deactivateTeacherMutation.isPending;

                                return (
                                    <TableRow key={teacher.id}>
                                        <TableCell>{teacher.staff_number}</TableCell>
                                        <TableCell className="font-medium">{teacher.full_name}</TableCell>
                                        <TableCell>{teacher.department_name || "-"}</TableCell>
                                        <TableCell>{teacher.qualification_name || "-"}</TableCell>
                                        <TableCell>{teacher.phone_number || "-"}</TableCell>
                                        <TableCell>
                                            {active ? (
                                                <Badge>Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="outline" onClick={() => onView?.(teacher)} title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" onClick={() => onEdit?.(teacher)} title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="secondary" onClick={() => onAssign?.(teacher)} title="Assignments">
                                                    <BookOpen className="h-4 w-4" />
                                                </Button>
                                                {active && (
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        disabled={processing}
                                                        title="Deactivate"
                                                        onClick={() => {
                                                            if (!window.confirm(`Deactivate ${teacher.full_name}?`)) return;
                                                            deactivateTeacherMutation.mutate(teacher.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                disabled={isFetching}
            />
        </div>
    );
}

export default TeacherTable;
