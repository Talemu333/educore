import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTeacher } from "@/hooks/useTeacher";
import { adminResetPassword } from "@/api/authApi";
import toast from "react-hot-toast";
import { Copy, KeyRound } from "lucide-react";

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function ViewTeacherSheet({ teacherId, open, onOpenChange }) {
    const { data: teacher, isLoading, refetch } = useTeacher(teacherId, open);
    const [resetting, setResetting] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const resetTeacherPassword = async () => {
        if (!teacher?.user_id) return;
        if (!window.confirm(`Generate a new temporary password for ${teacher.surname} ${teacher.first_name}?`)) return;
        setResetting(true);
        try {
            const response = await adminResetPassword(teacher.user_id);
            setCredentials(response.data);
            toast.success("New temporary password generated.");
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
        } finally { setResetting(false); }
    };

    const copyCredentials = async () => {
        if (!credentials) return;
        await navigator.clipboard.writeText(`Username: ${credentials.username}\nTemporary Password: ${credentials.temporary_password}`);
        toast.success("Credentials copied.");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-4xl overflow-y-auto bg-slate-50 p-0">
                <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-slate-900">Teacher Details</SheetTitle>
                    </SheetHeader>
                </div>

                <div className="px-6 py-6">
                    {isLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading teacher details...</div>
                    ) : teacher ? (
                        <div className="space-y-5">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
                                        <p className="mt-1 text-sm text-slate-500">Login details and password management.</p>
                                    </div>
                                    <button type="button" onClick={resetTeacherPassword} disabled={resetting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                                        <KeyRound className="h-4 w-4" />
                                        {resetting ? "Generating..." : "Reset Password"}
                                    </button>
                                </div>
                                <DetailRow label="Username" value={teacher.username} />
                                <DetailRow label="Password" value={teacher.must_change_password ? "Temporary password — change required" : "Password set by user"} />
                                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Passwords are never stored or displayed as plain text. If the original temporary password is forgotten, use Reset Password to generate a new one.</p>
                            </section>

                            <DetailSection title="Personal Information">
                                <DetailRow label="Staff Number" value={teacher.staff_number} />
                                <DetailRow label="Surname" value={teacher.surname} />
                                <DetailRow label="First Name" value={teacher.first_name} />
                                <DetailRow label="Middle Name" value={teacher.middle_name} />
                                <DetailRow label="Gender" value={teacher.gender} />
                                <DetailRow label="Date of Birth" value={formatDate(teacher.date_of_birth)} />
                            </DetailSection>

                            <DetailSection title="Employment Information">
                                <DetailRow label="Department" value={teacher.department_name} />
                                <DetailRow label="Qualification" value={teacher.qualification_name} />
                                <DetailRow label="Employment Date" value={formatDate(teacher.employment_date)} />
                                <DetailRow label="State" value={teacher.state_name} />
                                <DetailRow label="Nationality" value={teacher.nationality_name} />
                                <DetailRow label="Status" value={teacher.status ? "Active" : "Inactive"} />
                            </DetailSection>

                            <DetailSection title="Contact Information">
                                <DetailRow label="Phone" value={teacher.phone_number} />
                                <DetailRow label="Email" value={teacher.email} />
                                <DetailRow label="Address" value={teacher.address} />
                            </DetailSection>

                            <DetailSection title="Emergency Information">
                                <DetailRow label="Next of Kin" value={teacher.next_of_kin_name} />
                                <DetailRow label="Next of Kin Phone" value={teacher.next_of_kin_phone} />
                                <DetailRow label="Emergency Contact" value={teacher.emergency_contact_name} />
                                <DetailRow label="Emergency Phone" value={teacher.emergency_contact_phone} />
                            </DetailSection>
                        </div>
                    ) : <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Teacher not found.</div>}
                </div>

                {credentials && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">New Temporary Password</h2><p className="mt-1 text-sm text-slate-500">Give this password to the teacher. They should change it after logging in.</p><div className="mt-5 space-y-1 rounded-xl bg-slate-50 p-4"><DetailRow label="Username" value={credentials.username} /><DetailRow label="Password" value={credentials.temporary_password} /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={copyCredentials} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" />Copy Credentials</button><button type="button" onClick={() => setCredentials(null)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Done</button></div></div></div>}
            </SheetContent>
        </Sheet>
    );
}

function DetailSection({ title, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 border-b border-slate-100 pb-3 text-lg font-semibold text-slate-900">{title}</h3>
            <div>{children}</div>
        </section>
    );
}

function DetailRow({ label, value }) {
    return <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-3 sm:gap-4"><span className="font-medium text-slate-600">{label}</span><span className="break-words text-slate-900 sm:col-span-2">{value || "-"}</span></div>;
}

export default ViewTeacherSheet;
