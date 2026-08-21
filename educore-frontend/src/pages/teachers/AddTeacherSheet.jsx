import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import TeacherForm from "../../components/teachers/TeacherForm";

function AddTeacherSheet({

    teacher,

    open,

    onOpenChange,

}) {

    return (

        <Sheet

            open={open}

            onOpenChange={onOpenChange}

        >

            <SheetContent className="sm:max-w-3xl overflow-y-auto">

                <SheetHeader>

                    <SheetTitle>

                        {

                            teacher

                                ? "Edit Teacher"

                                : "Add Teacher"

                        }

                    </SheetTitle>

                </SheetHeader>

                <div className="mt-6">

                    <TeacherForm

                        teacher={teacher}

                        onSuccess={() => onOpenChange(false)}

                    />

                </div>

            </SheetContent>

        </Sheet>

    );

}

export default AddTeacherSheet;