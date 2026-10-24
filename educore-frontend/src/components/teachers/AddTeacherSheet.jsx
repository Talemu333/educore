import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { useTeacher } from "@/hooks/useTeacher";

import TeacherForm from "./TeacherForm";

function AddTeacherSheet({ teacherId, open, onOpenChange }) {
    const { data: teacher, isLoading } = useTeacher(teacherId);
    const [credentials, setCredentials] = useState(null);

    const handleOpenChange = (value) => {
        if (!value) setCredentials(null);
        onOpenChange(value);
    };

    const copyCredentials = async () => {
        if (!credentials) return;
        const text = `Username: ${credentials.username}\nTemporary Password: ${credentials.temporary_password}`;
        await navigator.clipboard.writeText(text);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton className="flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
                <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 text-left sm:px-7">
                    <DialogTitle className="text-xl font-extrabold text-slate-900">
                        {teacherId ? "Edit Teacher" : "Add Teacher"}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-slate-500">
                        {teacherId
                            ? "Update the teacher's personal, employment, contact and account information."
                            : "Enter the teacher's details below. Fields marked optional can be left blank."}
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6 sm:py-7">
                    {teacherId && isLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                            Loading teacher...
                        </div>
                    ) : (
                        <TeacherForm
                            teacher={teacher}
                            onSuccess={(result) => {
                                if (!teacherId && result?.data) {
                                    const account = result.data;
                                    setCredentials({
                                        username: account.username || account.teacher?.username,
                                        temporary_password: account.temporary_password || account.temporaryPassword
                                    });
                                    return;
                                }
                                handleOpenChange(false);
                            }}
                        />
                    )}
                </div>

                {credentials && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
                        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900">Teacher Account Created</h2>
                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Give these login details to the teacher. The temporary password is shown only now and is not stored as plain text.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</p>
                                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">{credentials.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Temporary Password</p>
                                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">{credentials.temporary_password}</p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={copyCredentials} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Copy Credentials
                                </button>
                                <button type="button" onClick={() => handleOpenChange(false)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default AddTeacherSheet;
