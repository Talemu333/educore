import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { getMySubjects } from "@/services/studentPortalService";

function StudentSubjectsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const result = await getMySubjects();
                if (mounted) setData(result);
            } catch (err) {
                if (mounted) {
                    setError(err?.response?.data?.message || "Unable to load your subjects.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="My Subjects"
                description="Subjects assigned to your current class."
            />

            {error ? (
                <div className="app-surface p-6 text-sm text-red-600">{error}</div>
            ) : (
                <>
                    <div className="app-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-slate-500">Student</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                    {data?.student?.name || "Student"}
                                </h2>
                            </div>
                            <div className="text-sm text-slate-600">
                                <span className="font-medium">Class:</span> {data?.student?.class_name || "—"}
                                {data?.student?.arm_name ? ` • ${data.student.arm_name}` : ""}
                            </div>
                        </div>
                    </div>

                    {!data?.subjects?.length ? (
                        <div className="app-surface p-8 text-center">
                            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                            <h2 className="mt-3 font-semibold text-slate-900">No subjects assigned</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Your class does not have any subjects assigned yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.subjects.map((subject) => (
                                <div key={subject.id} className="app-surface p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {subject.subject_name}
                                            </h3>
                                            {subject.subject_code && (
                                                <p className="mt-1 text-xs text-slate-500">{subject.subject_code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-500">
                                        {subject.is_compulsory ? "Compulsory subject" : "Subject"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default StudentSubjectsPage;
