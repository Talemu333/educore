import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { useTeacher } from "@/hooks/useTeacher";

import TeacherForm from "./TeacherForm";

function AddTeacherSheet({

    teacherId,

    open,

    onOpenChange

}) {

    const {

        data: teacher,

        isLoading

    } = useTeacher(teacherId);

    return (

        <Sheet

            open={open}

            onOpenChange={onOpenChange}

        >

            <SheetContent

                className="sm:max-w-4xl overflow-y-auto"

            >

                <SheetHeader>

                    <SheetTitle>

                        {teacherId ? "Edit Teacher" : "Add Teacher"}

                    </SheetTitle>

                </SheetHeader>

                <div className="mt-6">

                    {

                        teacherId && isLoading ? (

                            <p>Loading teacher...</p>

                        ) : (

                            <TeacherForm

                                teacher={teacher}

                                onSuccess={() =>

                                    onOpenChange(false)

                                }

                            />

                        )

                    }

                </div>

            </SheetContent>

        </Sheet>

    );

}

export default AddTeacherSheet;