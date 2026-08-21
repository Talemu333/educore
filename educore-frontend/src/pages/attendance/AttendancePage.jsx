import {
    useEffect,
    useMemo,
    useState
} from "react";


import {
    Button
} from "@/components/ui/Button";


import Loading
from "@/components/common/Loading";


import toast
from "react-hot-toast";


import {
    useSessions
} from "@/hooks/useSessions";


import {
    useTerms
} from "@/hooks/useTerms";


import {
    useClasses
} from "@/hooks/useClasses";


import {
    useArmsByClass
} from "@/hooks/useArmsByClass";


import {
    useAttendanceByDate,
    useStudentsForAttendance,
    useSaveAttendance
} from "@/hooks/useAttendance";


function AttendancePage() {

    /*
    =====================================
    FILTER STATES
    =====================================
    */

    const [
        sessionId,
        setSessionId
    ] = useState("");


    const [
        termId,
        setTermId
    ] = useState("");


    const [
        classId,
        setClassId
    ] = useState("");


    const [
        armId,
        setArmId
    ] = useState("");


    const [
        attendanceDate,
        setAttendanceDate
    ] = useState(

        new Date()
            .toISOString()
            .split("T")[0]

    );


    /*
    =====================================
    ATTENDANCE STATUS

    Only contains changes made by the user.

    We do NOT continuously synchronize
    this state inside useEffect.
    =====================================
    */

    const [
        attendanceStatuses,
        setAttendanceStatuses
    ] = useState({});


    /*
    =====================================
    LOAD SESSIONS
    =====================================
    */

    const {
        data: sessions = [],
        isLoading: isSessionsLoading
    } = useSessions();


    /*
    =====================================
    LOAD TERMS
    =====================================
    */

    const {
        data: terms = [],
        isLoading: isTermsLoading
    } = useTerms();


    /*
    =====================================
    LOAD CLASSES
    =====================================
    */

    const {
        data: classes = [],
        isLoading: isClassesLoading
    } = useClasses();


    /*
    =====================================
    LOAD ARMS
    =====================================
    */

    const {
        data: arms = [],
        isLoading: isArmsLoading
    } = useArmsByClass(
        classId
    );


    /*
    =====================================
    FILTER TERMS BY SESSION
    =====================================
    */

    const filteredTerms = useMemo(

        () => {

            return terms.filter(

                term =>

                    String(
                        term.session_id
                    ) ===

                    String(
                        sessionId
                    )

            );

        },

        [
            terms,
            sessionId
        ]

    );


    /*
    =====================================
    LOAD STUDENTS
    =====================================
    */

    const {
        data: students = [],
        isLoading: isStudentsLoading
    } = useStudentsForAttendance({

        sessionId,

        classId,

        armId

    });


    /*
    =====================================
    LOAD EXISTING ATTENDANCE
    =====================================
    */

    const {
        data: existingAttendance = [],
        isLoading: isAttendanceLoading
    } = useAttendanceByDate({

        classId,

        armId,

        attendanceDate

    });


    /*
    =====================================
    SAVE ATTENDANCE
    =====================================
    */

    const {
        mutate: saveAttendanceMutation,
        isPending: isSaving
    } = useSaveAttendance();


    /*
    =====================================
    CREATE DISPLAY STATUS

    Existing database attendance is used
    as the default.

    User changes in attendanceStatuses
    override the database value.

    IMPORTANT:

    This is derived data.

    We do NOT call setState here.
    =====================================
    */

    const displayStatuses = useMemo(

        () => {

            const statuses = {};


            students.forEach(

                student => {

                    const existing =
                        existingAttendance.find(

                            attendance =>

                                Number(
                                    attendance.student_id
                                ) ===

                                Number(
                                    student.id
                                )

                        );


                    statuses[
                        student.id
                    ] =

                        attendanceStatuses[
                            student.id
                        ] ||

                        existing?.status ||

                        "PRESENT";

                }

            );


            return statuses;

        },

        [
            students,
            existingAttendance,
            attendanceStatuses
        ]

    );


    /*
    =====================================
    RESET LOCAL CHANGES WHEN FILTER
    CHANGES

    This is safe because it only runs when
    the actual filter values change.
    =====================================
    */

    useEffect(

        () => {

            setAttendanceStatuses({});

        },

        [
            sessionId,
            termId,
            classId,
            armId,
            attendanceDate
        ]

    );


    /*
    =====================================
    HANDLE STATUS CHANGE
    =====================================
    */

    const handleStatusChange = (

        studentId,

        status

    ) => {

        setAttendanceStatuses(

            previous => ({

                ...previous,

                [studentId]:
                    status

            })

        );

    };


    /*
    =====================================
    MARK ALL PRESENT
    =====================================
    */

    const markAllPresent = () => {

        const statuses = {};


        students.forEach(

            student => {

                statuses[
                    student.id
                ] = "PRESENT";

            }

        );


        setAttendanceStatuses(
            statuses
        );

    };


    /*
    =====================================
    SAVE ATTENDANCE
    =====================================
    */

    const handleSaveAttendance = () => {

        /*
        ---------------------------------
        VALIDATION
        ---------------------------------
        */

        if (!sessionId) {

            toast.error(
                "Please select an academic session."
            );

            return;

        }


        if (!termId) {

            toast.error(
                "Please select a term."
            );

            return;

        }


        if (!classId) {

            toast.error(
                "Please select a class."
            );

            return;

        }


        if (!attendanceDate) {

            toast.error(
                "Please select an attendance date."
            );

            return;

        }


        if (!students.length) {

            toast.error(
                "No students found for the selected class."
            );

            return;

        }


        /*
        ---------------------------------
        BUILD REQUEST
        ---------------------------------
        */

        const data = {

            session_id:
                Number(sessionId),

            term_id:
                Number(termId),

            class_id:
                Number(classId),

            arm_id:

                armId

                    ? Number(armId)

                    : null,

            attendance_date:
                attendanceDate,

            students:

                students.map(

                    student => ({

                        student_id:
                            student.id,

                        status:

                            displayStatuses[
                                student.id
                            ] ||

                            "PRESENT"

                    })

                )

        };


        /*
        ---------------------------------
        SEND TO BACKEND
        ---------------------------------
        */

        saveAttendanceMutation(

            data,

            {

                onSuccess: () => {

                    toast.success(

                        "Attendance saved successfully."

                    );

                    /*
                    Clear only the local
                    modifications.

                    The database now contains
                    the latest values.
                    */

                    setAttendanceStatuses({});

                },


                onError: error => {

                    toast.error(

                        error.response
                            ?.data
                            ?.message ||

                        "Failed to save attendance."

                    );

                }

            }

        );

    };


    /*
    =====================================
    CHECK WHETHER STUDENTS CAN LOAD
    =====================================
    */

    const canLoadStudents =

        !!sessionId &&

        !!termId &&

        !!classId;


    /*
    =====================================
    RENDER
    =====================================
    */

    return (

        <div className="space-y-6">


            {/* PAGE HEADER */}

            <div>

                <h1 className="text-2xl font-bold">

                    Attendance

                </h1>


                <p className="mt-1 text-sm text-muted-foreground">

                    Record and manage daily
                    student attendance.

                </p>

            </div>


            {/* FILTER SECTION */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">


                    {/* SESSION */}

                    <div>

                        <label className="text-sm font-medium">

                            Academic Session

                        </label>


                        <select

                            value={sessionId}

                            onChange={event => {

                                setSessionId(
                                    event.target.value
                                );

                                setTermId("");

                                setClassId("");

                                setArmId("");

                            }}

                            disabled={
                                isSessionsLoading
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                Select Session

                            </option>


                            {sessions.map(

                                session => (

                                    <option

                                        key={
                                            session.id
                                        }

                                        value={
                                            session.id
                                        }

                                    >

                                        {
                                            session.session_name
                                        }

                                    </option>

                                )

                            )}

                        </select>

                    </div>


                    {/* TERM */}

                    <div>

                        <label className="text-sm font-medium">

                            Term

                        </label>


                        <select

                            value={termId}

                            onChange={event => {

                                setTermId(
                                    event.target.value
                                );

                            }}

                            disabled={

                                !sessionId ||

                                isTermsLoading

                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                {

                                    !sessionId

                                        ? "Select session first"

                                        : "Select Term"

                                }

                            </option>


                            {filteredTerms.map(

                                term => (

                                    <option

                                        key={
                                            term.id
                                        }

                                        value={
                                            term.id
                                        }

                                    >

                                        {
                                            term.term_name
                                        }

                                    </option>

                                )

                            )}

                        </select>

                    </div>


                    {/* CLASS */}

                    <div>

                        <label className="text-sm font-medium">

                            Class

                        </label>


                        <select

                            value={classId}

                            onChange={event => {

                                setClassId(
                                    event.target.value
                                );

                                setArmId("");

                            }}

                            disabled={
                                isClassesLoading
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                Select Class

                            </option>


                            {classes.map(

                                classItem => (

                                    <option

                                        key={
                                            classItem.id
                                        }

                                        value={
                                            classItem.id
                                        }

                                    >

                                        {
                                            classItem.class_name
                                        }

                                    </option>

                                )

                            )}

                        </select>

                    </div>


                    {/* ARM */}

                    <div>

                        <label className="text-sm font-medium">

                            Arm

                        </label>


                        <select

                            value={armId}

                            onChange={event => {

                                setArmId(
                                    event.target.value
                                );

                            }}

                            disabled={

                                !classId ||

                                isArmsLoading

                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                All Arms / No Arm

                            </option>


                            {arms.map(

                                arm => (

                                    <option

                                        key={
                                            arm.id
                                        }

                                        value={
                                            arm.id
                                        }

                                    >

                                        {
                                            arm.arm_name
                                        }

                                    </option>

                                )

                            )}

                        </select>

                    </div>


                    {/* DATE */}

                    <div>

                        <label className="text-sm font-medium">

                            Attendance Date

                        </label>


                        <input

                            type="date"

                            value={
                                attendanceDate
                            }

                            onChange={event => {

                                setAttendanceDate(
                                    event.target.value
                                );

                            }}

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        />

                    </div>

                </div>

            </div>


            {/* STUDENT LIST */}

            {!canLoadStudents ? (

                <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">

                    Select an academic session,
                    term and class to load students.

                </div>

            ) : (

                <div className="rounded-xl border bg-background shadow-sm">


                    {/* TABLE HEADER */}

                    <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-lg font-semibold">

                                Student Attendance

                            </h2>


                            <p className="mt-1 text-sm text-muted-foreground">

                                {students.length}

                                {" "}

                                student(s) found.

                            </p>

                        </div>


                        <Button

                            type="button"

                            variant="outline"

                            onClick={
                                markAllPresent
                            }

                            disabled={

                                !students.length ||

                                isSaving

                            }

                        >

                            Mark All Present

                        </Button>

                    </div>


                    {/* LOADING */}

                    {

                        isStudentsLoading ||

                        isAttendanceLoading ? (

                            <Loading

                                message="Loading attendance..."

                            />

                        ) : students.length === 0 ? (

                            <div className="p-10 text-center text-muted-foreground">

                                No active students were found
                                for the selected class and arm.

                            </div>

                        ) : (

                            <>

                                {/* TABLE */}

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="px-4 py-3 text-left">

                                                    S/N

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Admission No.

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Student Name

                                                </th>

                                                <th className="px-4 py-3 text-center">

                                                    Attendance Status

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {students.map(

                                                (
                                                    student,
                                                    index
                                                ) => (

                                                    <tr

                                                        key={
                                                            student.id
                                                        }

                                                        className="border-t"

                                                    >

                                                        <td className="px-4 py-3">

                                                            {
                                                                index + 1
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3">

                                                            {
                                                                student.admission_number
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3 font-medium">

                                                            {
                                                                student.student_name
                                                            }

                                                        </td>


                                                        <td className="px-4 py-3">

                                                            <select

                                                                value={

                                                                    displayStatuses[
                                                                        student.id
                                                                    ]

                                                                }

                                                                onChange={event =>

                                                                    handleStatusChange(

                                                                        student.id,

                                                                        event.target.value

                                                                    )

                                                                }

                                                                disabled={
                                                                    isSaving
                                                                }

                                                                className="mx-auto block w-full max-w-[180px] rounded-md border px-3 py-2"

                                                            >

                                                                <option value="PRESENT">

                                                                    Present

                                                                </option>


                                                                <option value="ABSENT">

                                                                    Absent

                                                                </option>


                                                                <option value="LATE">

                                                                    Late

                                                                </option>


                                                                <option value="EXCUSED">

                                                                    Excused

                                                                </option>

                                                            </select>

                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* SAVE BUTTON */}

                                <div className="flex justify-end border-t p-6">

                                    <Button

                                        type="button"

                                        onClick={
                                            handleSaveAttendance
                                        }

                                        disabled={
                                            isSaving
                                        }

                                    >

                                        {

                                            isSaving

                                                ? "Saving..."

                                                : existingAttendance.length > 0

                                                    ? "Update Attendance"

                                                    : "Save Attendance"

                                        }

                                    </Button>

                                </div>

                            </>

                        )

                    }

                </div>

            )}

        </div>

    );

}


export default AttendancePage;