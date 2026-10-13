import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X, RefreshCw } from "lucide-react";
import { getResultCorrectionRequests, reviewResultCorrectionRequest } from "@/services/resultService";

function formatScore(value) {
    return Number(value ?? 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });
}

function ResultCorrectionApprovalsPage() {
    const [status, setStatus] = useState("pending");
    const queryClient = useQueryClient();
    const { data: requests = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["result-correction-requests", status],
        queryFn: () => getResultCorrectionRequests(status)
    });

    const reviewMutation = useMutation({
        mutationFn: ({ id, decision, review_note }) => reviewResultCorrectionRequest(id, decision, review_note),
        onSuccess: async (result) => {
            toast.success(result.message || "Correction request reviewed.");
            await queryClient.invalidateQueries({ queryKey: ["result-correction-requests"] });
            await queryClient.invalidateQueries({ queryKey: ["results"] });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Unable to review this request.")
    });

    const review = (request, decision) => {
        let review_note = "";
        if (decision === "rejected") {
            review_note = window.prompt("Why are you rejecting this correction?") || "";
            if (review_note.trim().length < 3) {
                toast.error("Please provide a short reason for rejection.");
                return;
            }
        } else {
            review_note = window.prompt("Optional approval note:", "") || "";
        }
        reviewMutation.mutate({ id: request.id, decision, review_note: review_note.trim() });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Result Correction Approvals</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Review proposed changes to saved marks. Approved changes invalidate the published report until you publish it again.
                    </p>
                </div>
                <div className="flex gap-2">
                    <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={status} onChange={event => setStatus(event.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="all">All requests</option>
                    </select>
                    <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            {isLoading && <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">Loading correction requests…</p>}
            {isError && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error?.response?.data?.message || error?.message || "Could not load correction requests."}</p>}
            {!isLoading && !isError && requests.length === 0 && (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <p className="font-semibold text-slate-800">No {status === "all" ? "" : status + " "}correction requests</p>
                    <p className="mt-1 text-sm text-slate-500">Requests submitted by teachers will appear here.</p>
                </div>
            )}

            {requests.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="min-w-[1050px] w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Student / Subject</th>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Existing CA / Exam</th>
                                <th className="px-4 py-3">Proposed CA / Exam</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3">Status</th>
                                {status === "pending" || status === "all" ? <th className="px-4 py-3">Action</th> : null}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map(request => (
                                <tr key={request.id} className="align-top">
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-900">{request.student_name}</p>
                                        <p className="text-xs text-slate-500">{request.admission_number || "No admission number"} · {request.subject_name}</p>
                                    </td>
                                    <td className="px-4 py-4 text-slate-700">{request.class_name}{request.arm_name ? ` · ${request.arm_name}` : ""}</td>
                                    <td className="px-4 py-4 tabular-nums">{formatScore(request.old_ca_score)} / {formatScore(request.old_exam_score)}</td>
                                    <td className="px-4 py-4 font-semibold tabular-nums">{formatScore(request.proposed_ca_score)} / {formatScore(request.proposed_exam_score)}</td>
                                    <td className="max-w-xs whitespace-normal px-4 py-4 text-slate-700">{request.reason}</td>
                                    <td className="px-4 py-4 capitalize">{request.status}</td>
                                    {(status === "pending" || status === "all") && (
                                        <td className="px-4 py-4">
                                            {request.status === "pending" ? (
                                                <div className="flex gap-2">
                                                    <button disabled={reviewMutation.isPending} onClick={() => review(request, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button disabled={reviewMutation.isPending} onClick={() => review(request, "rejected")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : <span className="text-slate-400">Reviewed</span>}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="text-xs text-slate-500">For audit purposes, reviewed requests remain in the history. A rejected request leaves the saved result unchanged.</p>
        </div>
    );
}

export default ResultCorrectionApprovalsPage;
