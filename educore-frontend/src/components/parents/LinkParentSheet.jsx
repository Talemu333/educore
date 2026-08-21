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

        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >

            <SheetContent className="sm:max-w-xl overflow-y-auto">

                <SheetHeader>

                    <SheetTitle>

                        Link Existing Parent

                    </SheetTitle>

                </SheetHeader>

                <div className="mt-6">

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