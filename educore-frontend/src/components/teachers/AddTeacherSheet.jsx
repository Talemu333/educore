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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full overflow-y-auto border-l border-slate-200 bg-slate-50 p-0 sm:max-w-4xl"
            >
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
                            onSuccess={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default AddTeacherSheet;
