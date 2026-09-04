import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, UserX } from "lucide-react";
import toast from "react-hot-toast";

import { useStudents } from "../../hooks/useStudents";
import useDebounce from "../../hooks/useDebounce";
import { useDeactivateStudent } from "../../hooks/useDeactivateStudent";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Pagination from "@/components/common/Pagination";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

function StudentTable() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [studentToDeactivate, setStudentToDeactivate] = useState(null);

    const debouncedSearch = useDebounce(search);
    const deactivateStudentMutation = useDeactivateStudent();

    const { data, isLoading, isFetching, error } = useStudents(
        debouncedSearch,
        page,
        limit
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const students = data?.data ?? [];
    const total = Number(data?.total ?? students.length);
    const totalPages = Math.max(
        1,
        Number(data?.totalPages ?? Math.ceil(total / limit))
    );

    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        setPage(nextPage);
    };

    const handleLimitChange = (event) => {
        setLimit(Number(event.target.value));
        setPage(1);
    };

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-sm text-red-600">Failed to load students.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full sm:max-w-md"
                    />

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="whitespace-nowrap">Rows per page</span>
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

                <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        {total} student{total === 1 ? "" : "s"} found
                    </p>
                    {isFetching && !isLoading && (
                        <span className="text-xs text-slate-400">Updating...</span>
                    )}
                </div>

                {isLoading ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-muted-foreground">Loading students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-muted-foreground">No students found.</p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto rounded-lg border">
                        <Table className="min-w-[850px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Admission No</TableHead>
                                    <TableHead className="whitespace-nowrap">Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Gender</TableHead>
                                    <TableHead className="whitespace-nowrap">Class</TableHead>
                                    <TableHead className="whitespace-nowrap">Arm</TableHead>
                                    <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {student.admission_number}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <span className="font-medium">
                                                {student.surname} {student.first_name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{student.gender}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.class_name}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.arm_name}</TableCell>
                                        <TableCell className="whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button asChild variant="outline" size="icon-sm" title="View Student">
                                                    <Link to={`/students/${student.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild size="icon-sm" title="Edit Student">
                                                    <Link to={`/students/${student.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    title="Deactivate Student"
                                                    onClick={() => setStudentToDeactivate(student)}
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
                disabled={isFetching}
            />

            <AlertDialog
                open={!!studentToDeactivate}
                onOpenChange={(open) => {
                    if (!open) setStudentToDeactivate(null);
                }}
            >
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Student</AlertDialogTitle>
                        <AlertDialogDescription>
                            {studentToDeactivate && (
                                <>
                                    Are you sure you want to deactivate{" "}
                                    <strong>
                                        {studentToDeactivate.surname} {studentToDeactivate.first_name}
                                    </strong>
                                    ?
                                    <br />
                                    <br />
                                    The student will no longer appear in active student lists, but all academic records will be preserved.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
                            disabled={deactivateStudentMutation.isPending}
                            onClick={async () => {
                                try {
                                    await deactivateStudentMutation.mutateAsync(studentToDeactivate.id);
                                    toast.success("Student deactivated successfully.");
                                    setStudentToDeactivate(null);
                                } catch (err) {
                                    toast.error(
                                        err.response?.data?.message ||
                                        "Failed to deactivate student."
                                    );
                                }
                            }}
                        >
                            {deactivateStudentMutation.isPending ? "Deactivating..." : "Deactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default StudentTable;
