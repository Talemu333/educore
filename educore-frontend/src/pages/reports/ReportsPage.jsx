import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import api from "@/api/axios";
import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import { useClasses } from "@/hooks/useClasses";
import { useArmsByClass } from "@/hooks/useArmsByClass";

function ReportsPage() {
    const [sessionId, setSessionId] = useState("");
    const [termId, setTermId] = useState("");
    const [classId, setClassId] = useState("");
    const [armId, setArmId] = useState("");
    const [publication, setPublication] = useState(null);
    const [publishing, setPublishing] = useState(false);

    const { data: sessions = [] } = useSessions();
    const { data: terms = [] } = useTerms();
    const { data: classes = [] } = useClasses();
    const { data: arms = [] } = useArmsByClass(classId);

    const filteredTerms = useMemo(
        () => terms.filter(term => Number(term.session_id) === Number(sessionId)),
        [terms, sessionId]
    );

    useEffect(() => setTermId(""), [sessionId]);
    useEffect(() => setArmId(""), [classId]);

    useEffect(() => {
        const loadPublication = async () => {
            if (!sessionId || !termId || !classId || (arms.length > 0 && !armId)) {
                setPublication(null);
                return;
            }
            try {
                const response = await api.get("/results/publication", {
                    params: { sessionId, termId, classId, armId: armId || undefined },
                });
                setPublication(response.data?.data || null);
            } catch (error) {
                setPublication(null);
            }
        };
        loadPublication();
    }, [sessionId, termId, classId, armId, arms.length]);

    const publishResults = async () => {
        if (!sessionId || !termId || !classId || (arms.length > 0 && !armId)) {
            toast.error("Select the session, term, class and arm first.");
            return;
        }
        if (!window.confirm("Publish this result for students? Students in this class and arm will be able to view their report for the selected term.")) return;

        setPublishing(true);
        try {
            const response = await api.post("/results/publish", {
                session_id: Number(sessionId),
                term_id: Number(termId),
                class_id: Number(classId),
                arm_id: armId ? Number(armId) : null,
            });
            setPublication(response.data?.data || null);
            toast.success(response.data?.message || "Result published successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to publish result.");
        } finally {
            setPublishing(false);
        }
    };

    const selectionReady = Boolean(sessionId && termId && classId && (arms.length === 0 || armId));

    return (
        <div className="space-y-6">
            <PageHeader title="Reports" description="Review academic reports and control when term results become visible to students and parents." />

            <section className="app-surface overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><BarChart3 className="h-5 w-5" /></div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Result Publication</h2>
                            <p className="mt-1 text-sm text-slate-500">Publish a class result after checking the report sheet. Students and parents can only view results after publication.</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <label className="text-sm font-medium text-slate-700">Academic Session
                            <select value={sessionId} onChange={event => setSessionId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                                <option value="">Select session</option>
                                {sessions.map(session => <option key={session.id} value={session.id}>{session.session_name}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">Term
                            <select value={termId} onChange={event => setTermId(event.target.value)} disabled={!sessionId} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50">
                                <option value="">Select term</option>
                                {filteredTerms.map(term => <option key={term.id} value={term.id}>{term.term_name}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">Class
                            <select value={classId} onChange={event => setClassId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                                <option value="">Select class</option>
                                {classes.map(item => <option key={item.id} value={item.id}>{item.class_name}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">Arm
                            <select value={armId} onChange={event => setArmId(event.target.value)} disabled={!classId || arms.length === 0} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50">
                                {arms.length === 0 ? <option value="">No arm</option> : <><option value="">Select arm</option>{arms.map(arm => <option key={arm.id} value={arm.id}>{arm.arm_name}</option>)}</>}
                            </select>
                        </label>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            {publication ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />}
                            <div>
                                <p className="font-semibold text-slate-900">{publication ? "Result published" : "Result not published"}</p>
                                <p className="mt-1 text-sm text-slate-500">{publication ? `Published ${new Date(publication.published_at).toLocaleString()}. Students and parents can now view the result.` : "Students and parents cannot view this report until it is published."}</p>
                            </div>
                        </div>
                        <Button type="button" onClick={publishResults} disabled={publishing || !selectionReady || Boolean(publication)}>
                            {publishing ? "Publishing..." : publication ? "Published" : "Publish Result"}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ReportsPage;
