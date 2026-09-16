import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
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
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-4xl">
                <SheetHeader className="sticky top-0 z-40 border-b border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
                    <SheetTitle className="text-xl font-extrabold text-slate-900">
                        {teacherId ? "Edit Teacher" : "Add Teacher"}
                    </SheetTitle>
                    <SheetDescription className="text-sm leading-6 text-slate-500">
                        {teacherId
                            ? "Update the teacher's personal, employment, contact and account information."
                            : "Enter the teacher's details below. Required fields are validated before the record is saved."}
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 py-5 sm:px-6 sm:py-7">
                    {teacherId && isLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
                            Loading teacher...
                        </div>
                    ) : (
                        <TeacherForm
                            teacher={teacher}
                            onSuccess={(result) => {
                                if (!teacherId && result?.data) {
                                    setCredentials(result.data);
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
            </SheetContent>
        </Sheet>
    );
}

export default AddTeacherSheet;
