import { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import TeacherTable from "@/components/teachers/TeacherTable";
import AddTeacherSheet from "@/components/teachers/AddTeacherSheet";
import ViewTeacherSheet from "@/components/teachers/ViewTeacherSheet";
import TeacherAssignmentSheet from "@/components/teachers/TeacherAssignmentSheet";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { Plus, Search, UsersRound } from "lucide-react";


function TeachersPage() {
    const [open, setOpen] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewTeacherId, setViewTeacherId] = useState(null);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [assignmentOpen, setAssignmentOpen] = useState(false);
    const [assignmentTeacherId, setAssignmentTeacherId] = useState(null);

    const { data: departments = [] } = useDepartments();

    return (
        <div className="w-full space-y-5 sm:space-y-6">

            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Teachers
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                        Manage teaching staff, departments and class assignments.
                    </p>
                </div>

                <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                        setEditingTeacherId(null);
                        setOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Teacher
                </Button>
            </div>

            <div className="app-surface p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <UsersRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Teacher Directory</h2>
                        <p className="text-xs text-slate-500">Find staff and manage their assignments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_224px_176px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search teacher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Departments</SelectItem>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.department_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="app-surface overflow-hidden">
                <div className="w-full min-w-0 overflow-x-auto">
                    <TeacherTable
                        search={search}
                        departmentFilter={departmentFilter}
                        statusFilter={statusFilter}
                        onEdit={(teacher) => {
                            setEditingTeacherId(teacher.id);
                            setOpen(true);
                        }}
                        onView={(teacher) => {
                            setViewTeacherId(teacher.id);
                            setViewOpen(true);
                        }}
                        onAssign={(teacher) => {
                            setAssignmentTeacherId(teacher.id);
                            setAssignmentOpen(true);
                        }}
                    />
                </div>
            </div>

            <AddTeacherSheet
                teacherId={editingTeacherId}
                open={open}
                onOpenChange={(value) => {
                    setOpen(value);
                    if (!value) setEditingTeacherId(null);
                }}
            />

            <ViewTeacherSheet
                teacherId={viewTeacherId}
                open={viewOpen}
                onOpenChange={(value) => {
                    setViewOpen(value);
                    if (!value) setViewTeacherId(null);
                }}
            />

            <TeacherAssignmentSheet
                teacherId={assignmentTeacherId}
                open={assignmentOpen}
                onOpenChange={(value) => {
                    setAssignmentOpen(value);
                    if (!value) setAssignmentTeacherId(null);
                }}
            />
        </div>
    );
}

export default TeachersPage;
