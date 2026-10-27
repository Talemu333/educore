import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/Button";

const moneySafe = value => Number(value || 0).toLocaleString("en-NG");

export default function AttendanceAnalyticsPage() {
    const [sessionId, setSessionId] = useState("");
    const [termId, setTermId] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
    const { data: terms = [], isLoading: termsLoading } = useTerms();
    const filteredTerms = useMemo(() => terms.filter(term => !sessionId || Number(term.session_id) === Number(sessionId)), [terms, sessionId]);

    const handleSessionChange = (nextSessionId) => {
        // Clear the old term in the same event as the session change so the
        // report effect cannot request analytics for a term from another session.
        setSessionId(nextSessionId);
        setTermId("");
        setData(null);
        setError("");
    };

    const loadReport = async () => {
        const selectedTerm = terms.find(term => String(term.id) === String(termId));
        if (!sessionId || !termId || !selectedTerm || Number(selectedTerm.session_id) !== Number(sessionId)) {
            setData(null);
            setError("Select a valid academic session and a term belonging to that session.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/attendance/reports/analytics", {
                params: { session_id: sessionId, term_id: termId, date_from: dateFrom || undefined, date_to: dateTo || undefined }
            });
            setData(response.data?.data || null);
        } catch (e) {
            setData(null);
            setError(e.response?.data?.message || "Unable to load attendance analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId && termId) loadReport();
    }, [sessionId, termId]);

    const summary = data?.summary || {};
    const statusRows = [
        { label: "Present", value: Number(summary.present_count || 0) },
        { label: "Absent", value: Number(summary.absent_count || 0) },
        { label: "Late", value: Number(summary.late_count || 0) },
        { label: "Excused", value: Number(summary.excused_count || 0) }
    ];
    const maxStatus = Math.max(1, ...statusRows.map(row => row.value));
    const trend = data?.trend || [];
    const maxTrend = Math.max(1, ...trend.map(row => Number(row.marked_records || 0)));

    if (sessionsLoading || termsLoading) return <Loading message="Loading attendance analytics..." />;

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Attendance Analytics</h1>
                <p className="mt-1 text-sm text-muted-foreground">Review recorded attendance by status, class and date.</p>
            </header>
            <section className="grid gap-4 rounded-xl border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
                <label className="space-y-1 text-sm">Academic session<select className="w-full rounded-md border bg-background p-2" value={sessionId} onChange={e => handleSessionChange(e.target.value)}><option value="">Select session</option>{sessions.map(s => <option key={s.id} value={s.id}>{s.session_name}</option>)}</select></label>
                <label className="space-y-1 text-sm">Term<select className="w-full rounded-md border bg-background p-2" value={termId} onChange={e => setTermId(e.target.value)}><option value="">Select term</option>{filteredTerms.map(t => <option key={t.id} value={t.id}>{t.term_name}</option>)}</select></label>
                <label className="space-y-1 text-sm">From date<input className="w-full rounded-md border bg-background p-2" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
                <label className="space-y-1 text-sm">To date<input className="w-full rounded-md border bg-background p-2" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
                <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><Button type="button" onClick={loadReport} disabled={loading}>{loading ? "Loading..." : "Apply date range"}</Button><Button type="button" variant="outline" onClick={() => window.print()}>Print report</Button></div>
            </section>
            {error && <p className="rounded-lg border p-4 text-sm text-muted-foreground">{error}</p>}
            {loading && <Loading message="Calculating attendance analytics..." />}
            {data && !loading && <>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[["Attendance records", summary.marked_records], ["Students marked", summary.students_marked], ["Present", summary.present_count], ["Attendance rate", `${Number(summary.present_percentage || 0).toFixed(1)}%`]].map(([label, value]) => <div key={label} className="rounded-xl border bg-background p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value ?? 0}</p></div>)}
                </section>
                <section className="rounded-xl border bg-background p-5">
                    <h2 className="text-lg font-semibold">Attendance by status</h2>
                    <div className="mt-4 space-y-4">{statusRows.map(row => <div key={row.label} className="grid grid-cols-[5rem_minmax(0,1fr)_3rem] items-center gap-3"><span className="text-sm">{row.label}</span><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${row.value / maxStatus * 100}%` }} /></div><span className="text-right text-sm tabular-nums">{moneySafe(row.value)}</span></div>)}</div>
                </section>
                <section className="rounded-xl border bg-background p-5">
                    <h2 className="text-lg font-semibold">Class attendance</h2>
                    {(data.byClass || []).length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2 pr-3">Class</th><th className="py-2 pr-3">Marked</th><th className="py-2 pr-3">Present</th><th className="py-2 pr-3">Absent</th><th className="py-2">Present rate</th></tr></thead><tbody>{data.byClass.map(row => <tr className="border-b last:border-0" key={row.class_id}><td className="py-3 pr-3">{row.class_name}</td><td className="py-3 pr-3">{moneySafe(row.marked_records)}</td><td className="py-3 pr-3">{moneySafe(row.present_count)}</td><td className="py-3 pr-3">{moneySafe(row.absent_count)}</td><td className="py-3">{Number(row.present_percentage || 0).toFixed(1)}%</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-muted-foreground">No attendance records match these filters.</p>}
                </section>
                <section className="rounded-xl border bg-background p-5">
                    <h2 className="text-lg font-semibold">Daily attendance records</h2>
                    {trend.length ? <div className="mt-4 space-y-3">{trend.map(row => <div key={String(row.attendance_date)} className="grid grid-cols-[6rem_minmax(0,1fr)_3rem] items-center gap-3"><span className="text-xs text-muted-foreground">{new Date(row.attendance_date).toLocaleDateString("en-NG",{day:"2-digit",month:"short"})}</span><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Number(row.marked_records || 0) / maxTrend * 100}%` }} /></div><span className="text-right text-sm tabular-nums">{moneySafe(row.marked_records)}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No daily records found for this selection.</p>}
                </section>
            </>}
        </main>
    );
}
