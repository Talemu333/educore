import { useCallback, useEffect, useState } from "react";
import { Plus, MapPin, RotateCw } from "lucide-react";
import api from "@/api/axios";

export default function StateManagement() {
    const [states, setStates] = useState([]);
    const [stateName, setStateName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadStates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/super-admin/states");
            setStates(response.data?.data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load states.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStates(); }, [loadStates]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = stateName.trim().replace(/\s+/g, " ");
        if (!name) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const response = await api.post("/super-admin/states", { state_name: name });
            setStateName("");
            setSuccess(response.data?.message || "State added successfully.");
            await loadStates();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to add state.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-5 rounded-xl border bg-background p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-blue-50 p-2.5 text-blue-700"><MapPin className="h-5 w-5" /></span>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">State Management</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Manage the shared list of states used by schools across EduProw.</p>
                    </div>
                </div>
                <span className="text-sm text-muted-foreground">{states.length} {states.length === 1 ? "state" : "states"} registered</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="new-state-name">State name</label>
                <input
                    id="new-state-name"
                    name="state_name"
                    value={stateName}
                    onChange={(event) => setStateName(event.target.value)}
                    maxLength={100}
                    required
                    placeholder="Enter state name"
                    className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={saving || !stateName.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <Plus className="h-4 w-4" /> {saving ? "Adding..." : "Add State"}
                </button>
                <button type="button" onClick={loadStates} disabled={loading} aria-label="Refresh states" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
                    <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
            </form>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

            <div className="overflow-hidden rounded-lg border">
                {loading ? <p className="p-4 text-sm text-muted-foreground">Loading states...</p> : states.length ? (
                    <ul className="grid divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">
                        {states.map((state) => (
                            <li key={state.id} className="flex items-center gap-3 border-b p-3 text-sm last:border-b-0 sm:[&:nth-child(2n)]:border-b lg:[&:nth-child(3n)]:border-b-0">
                                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="font-medium text-slate-800">{state.state_name}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="p-4 text-sm text-muted-foreground">No states have been added yet.</p>}
            </div>
            <p className="text-xs text-muted-foreground">State names are shared across the platform. Duplicate names are rejected regardless of capitalization.</p>
        </section>
    );
}
