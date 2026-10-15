import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Pin, RefreshCw } from "lucide-react";
import { getAnnouncements, markAnnouncementRead } from "@/api/announcementApi";
import { useAuth } from "@/context/AuthContext";

const today = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const isManager = user => {
    const role = String(user?.role_name || user?.role || "").trim().toLowerCase();
    const type = String(user?.admin_type || "").trim().toLowerCase();
    return role === "principal" || (role === "admin" && ["proprietor", "principal", "vice_principal"].includes(type));
};
function AnnouncementSummary() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const manager = isManager(user);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        getAnnouncements({ page: 1, limit: 5, status: manager ? "active" : "" }).then(result => {
            if (!active) return;
            const rows = Array.isArray(result) ? result : result?.items || [];
            const visible = manager ? rows.filter(item => item.is_active && String(item.publish_date || "").slice(0, 10) <= today() && (!item.expiry_date || String(item.expiry_date).slice(0, 10) >= today())) : rows;
            setItems(visible.slice(0, 5));
            setUnread(Number(result?.unread_count || 0));
        }).catch(err => {
            if (active) setError(err?.response?.data?.message || "Announcements are temporarily unavailable.");
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [manager]);
    const markRead = async item => {
        try {
            await markAnnouncementRead(item.id);
            setItems(old => old.map(row => row.id === item.id ? { ...row, is_read: true } : row));
            setUnread(old => Math.max(0, old - 1));
        } catch (err) {
            setError(err?.response?.data?.message || "Could not mark this notice as read.");
        }
    };
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Bell size={20} /></div><div><h2 className="text-lg font-bold text-slate-900">Announcements</h2><p className="mt-0.5 text-xs text-slate-500">{manager ? "Latest school notices" : unread + " unread notice" + (unread === 1 ? "" : "s")}</p></div></div>
            <button type="button" onClick={() => navigate("/announcements")} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">View all <ChevronRight size={16} /></button>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin" />Loading notices…</div>
        : error ? <p className="px-4 py-5 text-sm text-slate-500">{error}</p>
        : items.length === 0 ? <div className="px-4 py-8 text-center"><Bell size={24} className="mx-auto text-slate-300" /><p className="mt-2 text-sm text-slate-500">No current announcements.</p></div>
        : <div className="divide-y divide-slate-100">{items.map(item => <div key={item.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5"><div className={"mt-1 h-2 w-2 shrink-0 rounded-full " + (item.is_read === false ? "bg-blue-600" : "bg-slate-200")} /><button type="button" onClick={() => navigate("/announcements")} className="min-w-0 flex-1 text-left"><span className="flex flex-wrap items-center gap-2"><span className="break-words font-semibold text-slate-800">{item.title}</span>{item.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"><Pin size={10} />Pinned</span>}</span><span className="mt-1 line-clamp-2 block whitespace-pre-wrap break-words text-sm text-slate-500">{item.message}</span></button>{!manager && item.is_read === false && <button type="button" title="Mark as read" aria-label="Mark announcement as read" onClick={() => markRead(item)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><CheckCheck size={16} /></button>}</div>)}</div>}
    </section>;
}
export default AnnouncementSummary;
