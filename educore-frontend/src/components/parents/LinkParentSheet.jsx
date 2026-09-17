import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import LinkParentForm from "./LinkParentForm";

function LinkParentSheet({
    studentId,
    open,
    onOpenChange,
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full overflow-y-auto sm:max-w-xl"
            >
                <SheetHeader className="border-b border-slate-200 pb-4">
                    <SheetTitle className="text-xl font-semibold text-slate-900">
                        Link Existing Parent
                    </SheetTitle>
                    <p className="text-sm text-slate-500">
                        Select a parent or guardian who already has an account in this school.
                    </p>
                </SheetHeader>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm sm:p-5">
                    <LinkParentForm
                        studentId={studentId}
                        onSuccess={() => onOpenChange(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default LinkParentSheet;
