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
            <SheetContent className="sm:max-w-4xl overflow-y-auto">
                <SheetHeader><SheetTitle>Teacher Details</SheetTitle></SheetHeader>
                {isLoading ? <p className="mt-6">Loading...</p> : teacher ? (
                    <div className="space-y-8 mt-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-semibold text-lg">Account Information</h3><p className="mt-1 text-sm text-slate-500">Login details and password management.</p></div><button type="button" onClick={resetTeacherPassword} disabled={resetting} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><KeyRound className="h-4 w-4" />{resetting ? "Generating..." : "Reset Password"}</button></div>
                            <DetailRow label="Username" value={teacher.username} />
                            <DetailRow label="Password" value={teacher.must_change_password ? "Temporary password — change required" : "Password set by user"} />
                            <p className="mt-3 text-xs leading-5 text-slate-500">Passwords are never stored or displayed as plain text. If the original temporary password is forgotten, use Reset Password to generate a new one.</p>
                        </section>
                        <section><h3 className="font-semibold text-lg mb-3">Personal Information</h3><DetailRow label="Staff Number" value={teacher.staff_number} /><DetailRow label="Surname" value={teacher.surname} /><DetailRow label="First Name" value={teacher.first_name} /><DetailRow label="Middle Name" value={teacher.middle_name} /><DetailRow label="Gender" value={teacher.gender} /><DetailRow label="Date of Birth" value={formatDate(teacher.date_of_birth)} /></section>
                        <section><h3 className="font-semibold text-lg mb-3">Employment Information</h3><DetailRow label="Department" value={teacher.department_name} /><DetailRow label="Qualification" value={teacher.qualification_name} /><DetailRow label="Employment Date" value={formatDate(teacher.employment_date)} /><DetailRow label="State" value={teacher.state_name} /><DetailRow label="Nationality" value={teacher.nationality_name} /><DetailRow label="Status" value={teacher.status ? "Active" : "Inactive"} /></section>
                        <section><h3 className="font-semibold text-lg mb-3">Contact Information</h3><DetailRow label="Phone" value={teacher.phone_number} /><DetailRow label="Email" value={teacher.email} /><DetailRow label="Address" value={teacher.address} /></section>
                        <section><h3 className="font-semibold text-lg mb-3">Emergency Information</h3><DetailRow label="Next of Kin" value={teacher.next_of_kin_name} /><DetailRow label="Next of Kin Phone" value={teacher.next_of_kin_phone} /><DetailRow label="Emergency Contact" value={teacher.emergency_contact_name} /><DetailRow label="Emergency Phone" value={teacher.emergency_contact_phone} /></section>
                    </div>
                ) : <p className="mt-6">Teacher not found.</p>}
                {credentials && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">New Temporary Password</h2><p className="mt-1 text-sm text-slate-500">Give this password to the teacher. They should change it after logging in.</p><div className="mt-5 space-y-1 rounded-xl bg-slate-50 p-4"><DetailRow label="Username" value={credentials.username} /><DetailRow label="Password" value={credentials.temporary_password} /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={copyCredentials} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><Copy className="h-4 w-4" />Copy Credentials</button><button type="button" onClick={() => setCredentials(null)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Done</button></div></div></div>}
            </SheetContent>
        </Sheet>
    );
}

function DetailRow({ label, value }) {
    return <div className="grid grid-cols-3 gap-4 border-b border-slate-200 py-2"><span className="font-medium text-slate-700">{label}</span><span className="col-span-2 break-words text-slate-900">{value || "-"}</span></div>;
}

export default ViewTeacherSheet;
