import { useState } from "react";

import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/common/PageHeader";
import ClassSubjectForm from "@/components/classSubjects/ClassSubjectForm";

function ClassSubjectsPage() {
    const [selectedClass, setSelectedClass] = useState("");

    return (
        <div className="space-y-6">
            <PageHeader
                title="Class Subjects"
                description="Assign and manage the subjects offered by each class."
            />

            <Card className="app-surface overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-slate-900">
                        Subject Assignment
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Select a class to view and manage its subject assignments.
                    </p>
                </div>

                <div className="p-5 sm:p-6">
                    <ClassSubjectForm
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                    />
                </div>
            </Card>
        </div>
    );
}

export default ClassSubjectsPage;
