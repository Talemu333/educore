import { useState } from "react";
import { useUnlinkParent } from "@/hooks/useUnlinkParent";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users, KeyRound, Copy } from "lucide-react";
import { useStudentParents } from "@/hooks/useStudentParents";
import AddParentSheet from "./AddParentSheet";
import LinkParentSheet from "../../parents/LinkParentSheet";
import api from "@/api/axios";
import toast from "react-hot-toast";

function StudentParentsTab({ studentId }) {
    const [addOpen, setAddOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [resettingParentId, setResettingParentId] = useState(null);
    const [credentials, setCredentials] = useState(null);

    const { data: parents = [], isLoading, error } = useStudentParents(studentId);
    const unlinkParentMutation = useUnlinkParent();

    const resetParentPassword = async (parent) => {
        if (!parent?.user_id) {
            toast.error("Parent login account was not found.");
            return;
        }

        if (!window.confirm(`Generate a new temporary password for ${parent.username}? Their current password will stop working.`)) return;

        setResettingParentId(parent.id);
        try {
            const response = await api.post(`/auth/admin-reset-password/${parent.user_id}`);
            const data = response.data?.data;
            setCredentials({ username: data.username, password: data.temporary_password });
            toast.success("New parent temporary password generated.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Failed to reset parent password.");
        } finally {
            setResettingParentId(null);
        }
    };

    const copyCredentials = async () => {
        if (!credentials) return;
        try {
            await navigator.clipboard.writeText(`Username: ${credentials.username}\nTemporary Password: ${credentials.password}`);
            toast.success("Credentials copied.");
        } catch {
            toast.error("Unable to copy credentials.");
        }
    };

    if (isLoading) return <p>Loading parents...</p>;
    if (error) return <p>Failed to load parents.</p>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">Parents & Guardians</h3>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button className="w-full sm:w-auto" onClick={() => { setEditingParent(null); setAddOpen(true); }}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Parent
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setLinkOpen(true)}>
                        Link Existing
                    </Button>
                </div>
            </div>

            {credentials && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h4 className="font-semibold text-emerald-950">Parent login credentials</h4>
                            <p className="mt-1 text-sm text-emerald-800">Give these credentials to the parent. The temporary password must be changed after login.</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-lg bg-white p-3 text-sm"><span className="block text-xs text-slate-500">Username</span><strong>{credentials.username}</strong></div>
                                <div className="rounded-lg bg-white p-3 text-sm"><span className="block text-xs text-slate-500">Temporary Password</span><strong className="font-mono">{credentials.password}</strong></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={copyCredentials}><Copy className="mr-2 h-4 w-4" />Copy</Button>
                            <Button type="button" variant="outline" onClick={() => setCredentials(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {parents.length === 0 ? (
                <Card>
                    <CardContent className="py-12 px-4 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No Parent Linked</h3>
                        <p className="mt-2 text-sm text-muted-foreground">This student has no linked parent or guardian.</p>
                    </CardContent>
                </Card>
            ) : (
                parents.map((parent) => (
                    <Card key={parent.id}>
                        <CardContent className="p-4 sm:py-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 gap-3 sm:gap-4">
                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarFallback>{parent.first_name?.charAt(0)}{parent.surname?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold break-words">{parent.surname} {parent.first_name}</h4>
                                            {parent.is_primary_contact && <Badge>Primary</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{parent.relationship_name}</p>
                                        <p className="text-sm break-all">📞 {parent.phone_number}</p>
                                        <p className="text-sm break-all">✉️ {parent.email || "-"}</p>
                                        {parent.username && (
                                            <p className="text-xs text-slate-500">
                                                Login: <span className="font-medium text-slate-700">{parent.username}</span> · {parent.must_change_password ? "Temporary password" : "Password changed"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                                    <Button variant="outline" size="sm" disabled={resettingParentId === parent.id || !parent.user_id} onClick={() => resetParentPassword(parent)}>
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        {resettingParentId === parent.id ? "Resetting..." : "Reset Password"}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => { setEditingParent(parent); setAddOpen(true); }}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => {
                                        const confirmed = window.confirm(`Remove ${parent.first_name} ${parent.surname} from this student?`);
                                        if (!confirmed) return;
                                        unlinkParentMutation.mutate({ studentId, parentId: parent.id });
                                    }}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            <AddParentSheet
                studentId={studentId}
                parent={editingParent}
                open={addOpen}
                onOpenChange={(value) => { setAddOpen(value); if (!value) setEditingParent(null); }}
            />

            <LinkParentSheet studentId={studentId} open={linkOpen} onOpenChange={setLinkOpen} />
        </div>
    );
}

export default StudentParentsTab;
