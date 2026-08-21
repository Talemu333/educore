import {

    Sheet,

    SheetContent,

    SheetHeader,

    SheetTitle

} from "@/components/ui/sheet";

import { useTeachers } from "@/hooks/useTeachers";

import { Separator } from "@/components/ui/separator";

function TeacherDetailsSheet({

    teacherId,

    open,

    onOpenChange

}) {

    const {

        data: teacher,

        isLoading

    } = useTeachers(teacherId);

    return (

        <Sheet

            open={open}

            onOpenChange={onOpenChange}

        >

            <SheetContent className="sm:max-w-2xl overflow-y-auto">

                <SheetHeader>

                    <SheetTitle>

                        Teacher Profile

                    </SheetTitle>

                </SheetHeader>

                {

                    isLoading && (

                        <p>Loading...</p>

                    )

                }

                {

                    teacher && (

                        <div className="space-y-6 mt-6">

                            <section>

                                <h3 className="font-semibold">

                                    Personal Information

                                </h3>

                                <Separator className="my-2"/>

                                <p>

                                    <strong>Name:</strong>{" "}

                                    {teacher.surname}{" "}

                                    {teacher.first_name}{" "}

                                    {teacher.middle_name}

                                </p>

                                <p>

                                    <strong>Gender:</strong>{" "}

                                    {teacher.gender}

                                </p>

                                <p>

                                    <strong>DOB:</strong>{" "}

                                    {teacher.date_of_birth}

                                </p>

                                <p>

                                    <strong>Phone:</strong>{" "}

                                    {teacher.phone_number}

                                </p>

                                <p>

                                    <strong>Email:</strong>{" "}

                                    {teacher.email}

                                </p>

                                <p>

                                    <strong>Username:</strong>{" "}

                                    {teacher.username}

                                </p>

                            </section>

                            <section>

                                <h3 className="font-semibold">

                                    Employment

                                </h3>

                                <Separator className="my-2"/>

                                <p>

                                    <strong>Staff No:</strong>{" "}

                                    {teacher.staff_number}

                                </p>

                                <p>

                                    <strong>Department:</strong>{" "}

                                    {teacher.department_name}

                                </p>

                                <p>

                                    <strong>Qualification:</strong>{" "}

                                    {teacher.qualification_name}

                                </p>

                                <p>

                                    <strong>Employment Date:</strong>{" "}

                                    {teacher.employment_date}

                                </p>

                            </section>

                            <section>

                                <h3 className="font-semibold">

                                    Emergency Contact

                                </h3>

                                <Separator className="my-2"/>

                                <p>

                                    <strong>Next of Kin:</strong>{" "}

                                    {teacher.next_of_kin_name}

                                </p>

                                <p>

                                    <strong>Phone:</strong>{" "}

                                    {teacher.next_of_kin_phone}

                                </p>

                                <p>

                                    <strong>Emergency Contact:</strong>{" "}

                                    {teacher.emergency_contact_name}

                                </p>

                                <p>

                                    <strong>Emergency Phone:</strong>{" "}

                                    {teacher.emergency_contact_phone}

                                </p>

                            </section>

                        </div>

                    )

                }

            </SheetContent>

        </Sheet>

    );

}

export default TeacherDetailsSheet;