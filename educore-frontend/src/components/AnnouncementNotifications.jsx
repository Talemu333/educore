import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink, Pin, RefreshCw } from "lucide-react";
import { downloadAnnouncementAttachment, getAnnouncementNotifications, markAllAnnouncementsRead, markAnnouncementRead } from "@/api/announcementApi";

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

export default function AnnouncementNotifications() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
            const data = await getAnnouncementNotifications();
            setItems(Array.isArray(data.announcements) ? data.announcements.slice(0, 4) : []);
            setUnreadCount(Number(data.unread_count || 0));
        } catch (err) {
            setError(err?.response?.data?.message || "Notifications could not be loaded.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const markRead = async (id) => {
        setBusy(true);
        try {
            await markAnnouncementRead(id);
            await load();
        } catch (err) {
            setError(err?.response?.data?.message || "Could not update the read status.");
        } finally { setBusy(false); }
    };

    const markAllRead = async () => {
        setBusy(true);
        try {
            await markAllAnnouncementsRead();
            await load();
        } catch (err) {
            setError(err?.response?.data?.message || "Could not mark announcements as read.");
        } finally { setBusy(false); }
    };

    return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Bell size={20} /></div>
                <div><h2 className="font-bold text-slate-900">Announcements</h2><p className="mt-0.5 text-sm text-slate-500">{unreadCount ? `${unreadCount} unread notice${unreadCount === 1 ? "" : "s"}` : "You're up to date"}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={load} disabled={loading || busy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh</button>
                {unreadCount > 0 && <button type="button" onClick={markAllRead} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><CheckCheck size={14} />Mark all read</button>}
            </div>
        </div>
        {error && <p role="status" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
        {loading ? <p className="mt-4 text-sm text-slate-500">Loading announcements...</p>
        : items.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No current announcements for you.</p>
        : <div className="mt-4 divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read ? "bg-slate-200" : "bg-blue-600"}`} />
            <div className="min-w-0 flex-1">
                <button type="button" onClick={() => navigate("/announcements")} className="text-left text-sm font-semibold text-slate-900 hover:text-blue-700">{item.is_pinned && <Pin size={13} className="mr-1 inline text-amber-600" />}{item.title}</button>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm text-slate-600">{item.message}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400"><span>{formatDate(item.publish_date)}</span>{!item.is_read && <button type="button" disabled={busy} onClick={() => markRead(item.id)} className="font-semibold text-blue-700 hover:underline disabled:opacity-50">Mark read</button>}{item.attachment_url && <a href={item.attachment_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">Attachment <ExternalLink size={12} /></a>}
                    {Array.isArray(item.attachments) && item.attachments.map((attachment) => <button key={attachment.id} type="button" onClick={async () => {
                        try { await downloadAnnouncementAttachment(item.id, attachment); }
                        catch (err) { setError(err?.response?.data?.message || "Could not download attachment."); }
                    }} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">{attachment.file_name} <ExternalLink size={12} /></button>)}</div>
            </div>
        </div>)}</div>}
        <div className="mt-4 border-t border-slate-100 pt-3"><button type="button" onClick={() => navigate("/announcements")} className="text-sm font-semibold text-blue-700 hover:underline">View all announcements →</button></div>
    </section>;
}
