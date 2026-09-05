import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, History } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { getAvailableCbtExams, getMyCbtAttempts } from "@/api/cbtApi";

function StudentCbtPage() {
    const examsQuery = useQuery({
        queryKey: ["student-cbt-exams"],
        queryFn: getAvailableCbtExams,
    });

    const attemptsQuery = useQuery({
        queryKey: ["student-cbt-attempts"],
        queryFn: getMyCbtAttempts,
    });

    const exams = examsQuery.data || [];
    const attempts = attemptsQuery.data || [];
    const loading = examsQuery.isLoading || attemptsQuery.isLoading;
    const error = examsQuery.error || attemptsQuery.error;

    if (loading) {
        return <div className="py-12 text-center text-sm text-slate-500">Loading CBT...</div>;
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-700">Unable to load CBT</h2>
                <p className="mt-2 text-sm text-red-600">
                    {error?.response?.data?.message || "Something went wrong."}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <PageHeader
                title="CBT Practice"
                description="Take computer-based tests assigned to your class and review your previous attempts."
            />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Available Tests</h2>
                        <p className="text-sm text-slate-500">Only currently published tests for your class are shown.</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {exams.length} available
                    </span>
                </div>

                {exams.length === 0 ? (
                    <div className="app-surface p-8 text-center">
                        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 font-medium text-slate-700">No CBT is currently available.</p>
                        <p className="mt-1 text-sm text-slate-500">Check back when your school publishes a test for your class.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {exams.map((exam) => {
                            const attemptsLeft = Math.max(0, Number(exam.max_attempts) - Number(exam.attempt_count));
                            return (
                                <div key={exam.id} className="app-surface p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{exam.title}</h3>
                                            <p className="mt-1 text-sm font-medium text-blue-700">{exam.subject_name}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {exam.description && (
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{exam.description}</p>
                                    )}

                                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                        <div className="rounded-lg bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Duration</p>
                                            <p className="mt-1 font-semibold text-slate-800">{exam.duration_minutes} min</p>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Total Marks</p>
                                            <p className="mt-1 font-semibold text-slate-800">{exam.total_marks}</p>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Attempts Left</p>
                                            <p className="mt-1 font-semibold text-slate-800">{attemptsLeft}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex justify-end">
                                        <Button asChild disabled={attemptsLeft <= 0}>
                                            <Link to={`/student-cbt-exam?examId=${exam.id}`}>
                                                {attemptsLeft > 0 ? "Start Test" : "No Attempts Left"}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-600" />
                    <h2 className="text-xl font-semibold text-slate-900">My Attempts</h2>
                </div>

                {attempts.length === 0 ? (
                    <div className="app-surface p-6 text-sm text-slate-500">You have not taken any CBT yet.</div>
                ) : (
                    <div className="app-surface overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b bg-slate-50 text-left text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Test</th>
                                        <th className="px-4 py-3 font-medium">Subject</th>
                                        <th className="px-4 py-3 font-medium">Attempt</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {attempts.map((attempt) => (
                                        <tr key={attempt.id}>
                                            <td className="px-4 py-3 font-medium text-slate-800">{attempt.title}</td>
                                            <td className="px-4 py-3 text-slate-600">{attempt.subject_name}</td>
                                            <td className="px-4 py-3 text-slate-600">#{attempt.attempt_number}</td>
                                            <td className="px-4 py-3 capitalize text-slate-600">{attempt.status.replace("_", " ")}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {attempt.status === "submitted" || attempt.status === "expired"
                                                    ? `${attempt.percentage}%`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default StudentCbtPage;
