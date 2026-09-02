import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Plus, GraduationCap } from "lucide-react";

import StudentTable from "../../components/students/StudentTable";
import PageHeader from "../../components/common/PageHeader";


function StudentsPage() {
    return (
        <div className="w-full space-y-5 sm:space-y-6">

            <PageHeader
                title="Students"
                description="Manage student records, profiles and academic information."
                action={
                    <Button asChild className="w-full sm:w-auto">
                        <Link
                            to="/students/new"
                            className="flex w-full items-center justify-center sm:w-auto"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Student
                        </Link>
                    </Button>
                }
            />

            <div className="app-surface overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                            Student Directory
                        </h2>
                        <p className="text-xs text-slate-500">
                            Search and manage enrolled students.
                        </p>
                    </div>
                </div>

                <div className="w-full min-w-0 overflow-x-auto">
                    <StudentTable />
                </div>
            </div>
        </div>
    );
}

export default StudentsPage;
