import { UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

function ParentsPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="Parents & Guardians"
                description="Parent accounts and student-parent relationships are managed from each student's profile."
            />

            <Card className="app-surface">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <UsersRound className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        Manage parents from student profiles
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Open a student profile to add, edit, link, remove or reset the password of a parent or guardian connected to that student.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/students")}>
                        Open Students
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default ParentsPage;
