import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import toast from "react-hot-toast";

export default function ProprietorAccountSettings() {
    const { user, setUser } = useAuth();
    const isProprietor = String(user?.role_name || "").trim().toLowerCase() === "admin" &&
        String(user?.admin_type || "").trim().toLowerCase() === "proprietor";
    const [username, setUsername] = useState(user?.username || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => setUsername(user?.username || ""), [user?.username]);
    if (!isProprietor) return null;

    const submit = async event => {
        event.preventDefault();
        const nextUsername = username.trim();
        if (!/^[A-Za-z0-9._-]{3,30}$/.test(nextUsername)) {
            toast.error("Username must be 3–30 characters and contain only letters, numbers, dots, underscores or hyphens.");
            return;
        }
        if (nextUsername === user?.username) {
            toast("Your username has not changed.");
            return;
        }
        setSaving(true);
        try {
            const response = await api.patch("/auth/username", { username: nextUsername });
            setUser(current => current ? { ...current, username: response.data.username } : current);
            setUsername(response.data.username);
            toast.success(response.data.message || "Username updated successfully.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Unable to update username.");
        } finally {
            setSaving(false);
        }
    };

    return <section className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
        <div>
            <h2 className="text-base font-semibold sm:text-lg">Proprietor Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Change the username used to sign in to this school account. Your password will remain unchanged.</p>
        </div>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:max-w-xl">
            <div>
                <label htmlFor="proprietor-username" className="text-sm font-medium">Login username</label>
                <input id="proprietor-username" type="text" autoComplete="username" value={username}
                    onChange={event => setUsername(event.target.value)}
                    minLength={3} maxLength={30} required
                    className="mt-1 block w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"/>
                <p className="mt-1 text-xs text-muted-foreground">3–30 characters. Letters, numbers, dots, underscores and hyphens only.</p>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={saving || username.trim() === (user?.username || "")}
                    className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                    {saving ? "Updating..." : "Update Username"}
                </button>
            </div>
        </form>
    </section>;
}
