import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap } from "lucide-react";

import { getParentDashboard } from "@/api/parentApi";
import StudentResultsTab from "@/components/students/profile/StudentResultsTab";
import Loading from "@/components/common/Loading";

function ParentResultsPage() {

    const [selectedChildId, setSelectedChildId] = useState(null);

    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["parent-dashboard"],
        queryFn: getParentDashboard
    });

    if (isLoading) {
        return (
            <Loading message="Loading your children..." />
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-destructive p-6 text-destructive">
                <h2 className="font-semibold">
                    Unable to load your children
                </h2>

                <p className="mt-1 text-sm">
                    {error?.response?.data?.message ||
                        "Something went wrong."}
                </p>
            </div>
        );
    }

    const children = data?.children || [];

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-3xl font-bold">
                    My Children's Results
                </h1>

                <p className="mt-1 text-gray-600">
                    Select a child to view their academic results.
                </p>
            </div>

            {/* Children */}

            {!selectedChildId && (

                <div className="space-y-4">

                    {children.length === 0 ? (

                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-gray-500">
                                No children are currently linked to your account.
                            </p>
                        </div>

                    ) : (

                        children.map((child) => (

                            <div
                                key={child.id}
                                className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                            >

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-start gap-4">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">

                                            <GraduationCap className="h-6 w-6" />

                                        </div>

                                        <div>

                                            <h2 className="text-lg font-semibold">

                                                {child.student_name}

                                            </h2>

                                            <p className="text-sm text-gray-500">

                                                {child.admission_number}

                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">

                                                {child.class_name || "Class not assigned"}

                                                {" • "}

                                                {child.arm_name || "Arm not assigned"}

                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedChildId(child.id)
                                        }
                                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white transition hover:bg-blue-800"
                                    >

                                        View Results

                                        <ArrowRight className="h-4 w-4" />

                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            )}

            {/* Selected Child Result */}

            {selectedChildId && (

                <div className="space-y-4">

                    <button
                        type="button"
                        onClick={() => setSelectedChildId(null)}
                        className="text-sm font-medium text-blue-700 hover:underline"
                    >
                        ← Back to My Children
                    </button>

                    <StudentResultsTab
                        studentId={Number(selectedChildId)}
                    />

                </div>

            )}

        </div>
    );
}

export default ParentResultsPage;