import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";

import { useTeacher } from "@/hooks/useTeacher";

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {

        day: "2-digit",

        month: "long",

        year: "numeric"

    });

}

function ViewTeacherSheet({

    teacherId,

    open,

    onOpenChange

}) {

    const {

        data: teacher,

        isLoading

    } = useTeacher(teacherId, open);

    return (

        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >

            <SheetContent className="sm:max-w-4xl overflow-y-auto">

                <SheetHeader>

                    <SheetTitle>

                        Teacher Details

                    </SheetTitle>

                </SheetHeader>

                {

                    isLoading ? (

                        <p className="mt-6">

                            Loading...

                        </p>

                    ) : teacher ? (

                        <div className="space-y-8 mt-6">

                            <section>

                                <h3 className="font-semibold text-lg mb-3">

                                    Personal Information

                                </h3>

                                <DetailRow
                                    label="Staff Number"
                                    value={teacher.staff_number}
                                />

                                <DetailRow
                                    label="Surname"
                                    value={teacher.surname}
                                />

                                <DetailRow
                                    label="First Name"
                                    value={teacher.first_name}
                                />

                                <DetailRow
                                    label="Middle Name"
                                    value={teacher.middle_name}
                                />

                                <DetailRow
                                    label="Gender"
                                    value={teacher.gender}
                                />

                                <DetailRow
                                    label="Date of Birth"
                                    value={formatDate(teacher.date_of_birth)}
                                />

                            </section>

                            <section>

                                <h3 className="font-semibold text-lg mb-3">

                                    Employment Information

                                </h3>

                                <DetailRow
                                    label="Department"
                                    value={teacher.department_name}
                                />

                                <DetailRow
                                    label="Qualification"
                                    value={teacher.qualification_name}
                                />

                                <DetailRow
                                    label="Employment Date"
                                    value={formatDate(teacher.employment_date)}
                                />

                                <DetailRow
                                    label="State"
                                    value={teacher.state_name}
                                />

                                <DetailRow
                                    label="Nationality"
                                    value={teacher.nationality_name}
                                />

                                <DetailRow
                                    label="Status"
                                    value={teacher.status ? "Active" : "Inactive"}
                                />

                            </section>

                            <section>

                                <h3 className="font-semibold text-lg mb-3">

                                    Contact Information

                                </h3>

                                <DetailRow
                                    label="Phone"
                                    value={teacher.phone_number}
                                />

                                <DetailRow
                                    label="Email"
                                    value={teacher.email}
                                />

                                <DetailRow
                                    label="Address"
                                    value={teacher.address}
                                />

                            </section>

                            <section>

                                <h3 className="font-semibold text-lg mb-3">

                                    Emergency Information

                                </h3>

                                <DetailRow
                                    label="Next of Kin"
                                    value={teacher.next_of_kin_name}
                                />

                                <DetailRow
                                    label="Next of Kin Phone"
                                    value={teacher.next_of_kin_phone}
                                />

                                <DetailRow
                                    label="Emergency Contact"
                                    value={teacher.emergency_contact_name}
                                />

                                <DetailRow
                                    label="Emergency Phone"
                                    value={teacher.emergency_contact_phone}
                                />

                            </section>

                        </div>

                    ) : (

                        <p className="mt-6">

                            Teacher not found.

                        </p>

                    )

                }

            </SheetContent>

        </Sheet>

    );

}

function DetailRow({

    label,

    value

}) {

    return (

        <div className="grid grid-cols-3 gap-4 py-2 border-b">

            <span className="font-medium">

                {label}

            </span>

            <span className="col-span-2">

                {value || "-"}

            </span>

        </div>

    );

}

export default ViewTeacherSheet;