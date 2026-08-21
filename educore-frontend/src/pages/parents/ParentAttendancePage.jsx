import {
    useMemo,
    useState
} from "react";

import { useQuery } from "@tanstack/react-query";

import {
    getParentDashboard
} from "@/api/parentApi";

import {
    useParentStudentAttendance,
    useParentAttendanceSummary
} from "@/hooks/useParentAttendance";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useTerms
} from "@/hooks/useTerms";

import Loading
from "@/components/common/Loading";


function ParentAttendancePage() {

    /*
    =====================================
    CHILD
    =====================================
    */

    const [
        selectedChildId,
        setSelectedChildId
    ] = useState("");


    /*
    =====================================
    SESSION
    =====================================
    */

    const [
        sessionId,
        setSessionId
    ] = useState("");


    /*
    =====================================
    TERM
    =====================================
    */

    const [
        termId,
        setTermId
    ] = useState("");


    /*
    =====================================
    LOAD PARENT + CHILDREN
    =====================================
    */

    const {
        data: parentData,
        isLoading: isParentLoading,
        isError: isParentError
    } = useQuery({

        queryKey: [
            "parent-dashboard"
        ],

        queryFn:
            getParentDashboard

    });


    const children =
        parentData?.children || [];


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
    ATTENDANCE
    =====================================
    */

    const {
        data: attendance = [],
        isLoading: isAttendanceLoading,
        isError: isAttendanceError
    } =
        useParentStudentAttendance({

            studentId:
                selectedChildId,

            sessionId,

            termId

        });


    /*
    =====================================
    ATTENDANCE SUMMARY
    =====================================
    */

    const {
        data: summary,
        isLoading: isSummaryLoading,
        isError: isSummaryError
    } =
        useParentAttendanceSummary({

            studentId:
                selectedChildId,

            sessionId,

            termId

        });


    /*
    =====================================
    LOADING PARENT
    =====================================
    */

    if (isParentLoading) {

        return (

            <Loading
                message="Loading your children..."
            />

        );

    }


    /*
    =====================================
    PARENT ERROR
    =====================================
    */

    if (isParentError) {

        return (

            <div className="rounded-lg border border-destructive p-6">

                <h2 className="font-semibold text-destructive">

                    Unable to load children

                </h2>

                <p className="mt-1 text-sm text-muted-foreground">

                    Something went wrong while loading
                    your children's information.

                </p>

            </div>

        );

    }


    /*
    =====================================
    FORMAT DATE
    =====================================
    */

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }

        return new Date(
            date
        ).toLocaleDateString(

            "en-NG",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

    };


    /*
    =====================================
    FORMAT STATUS
    =====================================
    */

    const formatStatus = (status) => {

        if (!status) {

            return "-";

        }

        return status
            .toLowerCase()
            .replace(
                /^\w/,
                letter =>
                    letter.toUpperCase()
            );

    };


    return (

        <div className="space-y-6">


            {/* PAGE HEADER */}

            <div>

                <h1 className="text-2xl font-bold">

                    Attendance

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    View your child's attendance record.

                </p>

            </div>


            {/* FILTER SECTION */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <div className="grid gap-4 md:grid-cols-3">


                    {/* CHILD */}

                    <div>

                        <label className="text-sm font-medium">

                            Child

                        </label>

                        <select

                            value={
                                selectedChildId
                            }

                            onChange={event => {

                                setSelectedChildId(
                                    event.target.value
                                );

                                setSessionId("");

                                setTermId("");

                            }}

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                Select Child

                            </option>


                            {children.map(

                                child => (

                                    <option

                                        key={
                                            child.id
                                        }

                                        value={
                                            child.id
                                        }

                                    >

                                        {
                                            child.student_name
                                        }

                                        {" — "}

                                        {
                                            child.admission_number
                                        }

                                    </option>

                                )

                            )}

                        </select>

                    </div>


                    {/* SESSION */}

                    <div>

                        <label className="text-sm font-medium">

                            Academic Session

                        </label>

                        <select

                            value={
                                sessionId
                            }

                            onChange={event => {

                                setSessionId(
                                    event.target.value
                                );

                                setTermId("");

                            }}

                            disabled={

                                !selectedChildId ||

                                isSessionsLoading

                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                {

                                    !selectedChildId

                                        ? "Select child first"

                                        : isSessionsLoading

                                            ? "Loading sessions..."

                                            : "Select Session"

                                }

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

                            value={
                                termId
                            }

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

                                        : isTermsLoading

                                            ? "Loading terms..."

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

                </div>

            </div>


            {/* NO FILTERS */}

            {

                !selectedChildId ||

                !sessionId ||

                !termId ? (

                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">

                        Select a child, academic session
                        and term to view attendance.

                    </div>

                ) : null

            }


            {/* SUMMARY */}

            {

                selectedChildId &&

                sessionId &&

                termId && (

                    <div className="rounded-xl border bg-background p-6 shadow-sm">

                        <h2 className="text-lg font-semibold">

                            Attendance Summary

                        </h2>


                        {

                            isSummaryLoading ? (

                                <div className="mt-4">

                                    <Loading
                                        message="Loading attendance summary..."
                                    />

                                </div>

                            ) : isSummaryError ? (

                                <p className="mt-4 text-sm text-destructive">

                                    Unable to load attendance summary.

                                </p>

                            ) : (

                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">


                                    <div className="rounded-lg border p-4">

                                        <p className="text-sm text-muted-foreground">

                                            Total Days

                                        </p>

                                        <p className="mt-2 text-2xl font-bold">

                                            {
                                                summary?.total_days
                                                ?? 0
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-lg border p-4">

                                        <p className="text-sm text-muted-foreground">

                                            Present

                                        </p>

                                        <p className="mt-2 text-2xl font-bold text-green-600">

                                            {
                                                summary?.present_days
                                                ?? 0
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-lg border p-4">

                                        <p className="text-sm text-muted-foreground">

                                            Absent

                                        </p>

                                        <p className="mt-2 text-2xl font-bold text-red-600">

                                            {
                                                summary?.absent_days
                                                ?? 0
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-lg border p-4">

                                        <p className="text-sm text-muted-foreground">

                                            Late

                                        </p>

                                        <p className="mt-2 text-2xl font-bold text-yellow-600">

                                            {
                                                summary?.late_days
                                                ?? 0
                                            }

                                        </p>

                                    </div>


                                    <div className="rounded-lg border p-4">

                                        <p className="text-sm text-muted-foreground">

                                            Attendance

                                        </p>

                                        <p className="mt-2 text-2xl font-bold">

                                            {
                                                summary
                                                    ?.attendance_percentage
                                                ?? 0
                                            }%

                                        </p>

                                    </div>

                                </div>

                            )

                        }

                    </div>

                )

            }


            {/* HISTORY */}

            {

                selectedChildId &&

                sessionId &&

                termId && (

                    <div className="rounded-xl border bg-background shadow-sm">

                        <div className="border-b p-6">

                            <h2 className="text-lg font-semibold">

                                Attendance History

                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">

                                Daily attendance records for the selected term.

                            </p>

                        </div>


                        {

                            isAttendanceLoading ? (

                                <div className="p-6">

                                    <Loading
                                        message="Loading attendance records..."
                                    />

                                </div>

                            ) : isAttendanceError ? (

                                <div className="p-6">

                                    <p className="text-sm text-destructive">

                                        Unable to load attendance records.

                                    </p>

                                </div>

                            ) : attendance.length === 0 ? (

                                <div className="p-10 text-center text-muted-foreground">

                                    No attendance records found
                                    for the selected term.

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="px-4 py-3 text-left">

                                                    S/N

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Date

                                                </th>

                                                <th className="px-4 py-3 text-left">

                                                    Status

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {attendance.map(

                                                (
                                                    record,
                                                    index
                                                ) => (

                                                    <tr

                                                        key={
                                                            record.id
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
                                                                formatDate(
                                                                    record.attendance_date
                                                                )
                                                            }

                                                        </td>

                                                        <td className="px-4 py-3 font-medium">

                                                            {
                                                                formatStatus(
                                                                    record.status
                                                                )
                                                            }

                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )

                        }

                    </div>

                )

            }

        </div>

    );

}


export default ParentAttendancePage;