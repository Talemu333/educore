import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Printer } from "lucide-react";

import { useClasses } from "@/hooks/useClasses";
import { useArms } from "@/hooks/useArms";
import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";

import {
    useClassBroadsheet
} from "@/hooks/useClassBroadsheet";

import Loading from "@/components/common/Loading";


function ClassBroadsheetPage() {

    const [

        classId,

        setClassId

    ] = useState("");

    const [

        armId,

        setArmId

    ] = useState("");

    const [

        sessionId,

        setSessionId

    ] = useState("");

    const [

        termId,

        setTermId

    ] = useState("");


    /*
    =====================================
    LOAD SELECTOR DATA
    =====================================
    */

    const {

        data: classes = [],

        isLoading: isClassesLoading

    } = useClasses();


    const {

        data: arms = [],

        isLoading: isArmsLoading

    } = useArms();


    const {

        data: sessions = [],

        isLoading: isSessionsLoading

    } = useSessions();


    const {

        data: terms = [],

        isLoading: isTermsLoading

    } = useTerms();


    /*
    =====================================
    FILTER ARMS BY CLASS
    =====================================
    */

    const filteredArms =
        arms.filter(

            arm =>

                Number(
                    arm.class_id
                ) === Number(classId)

        );


    /*
    =====================================
    FILTER TERMS BY SESSION
    =====================================
    */

    const filteredTerms =
        terms.filter(

            term =>

                Number(
                    term.session_id
                ) === Number(sessionId)

        );


    /*
    =====================================
    LOAD BROADSHEET
    =====================================
    */

    const {

        data: broadsheet,

        isLoading,

        error

    } = useClassBroadsheet(

        classId,

        armId || null,

        sessionId,

        termId

    );


    /*
    =====================================
    POSITION FORMATTER
    =====================================
    */

    const formatPosition = (
        position
    ) => {

        if (

            position === null ||

            position === undefined

        ) {

            return "-";

        }

        const number =
            Number(position);

        const lastTwoDigits =
            number % 100;


        if (

            lastTwoDigits >= 11 &&

            lastTwoDigits <= 13

        ) {

            return `${number}th`;

        }


        switch (
            number % 10
        ) {

            case 1:

                return `${number}st`;


            case 2:

                return `${number}nd`;


            case 3:

                return `${number}rd`;


            default:

                return `${number}th`;

        }

    };


    return (

        <div className="space-y-6">


            {/* PAGE HEADER */}

            <div>

                <h1 className="text-2xl font-bold">

                    Class Broadsheet

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    View students' performance across all
                    subjects for a selected class, session,
                    and term.

                </p>

            </div>


            {/* FILTERS */}

            <div className="rounded-lg border p-6">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                    {/* CLASS */}

                    <div>

                        <label className="text-sm font-medium">

                            Class

                        </label>

                        <select

                            value={classId}

                            onChange={(event) => {

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

                            {

                                classes.map(
                                    classItem => (

                                        <option

                                            key={
                                                classItem.id
                                            }

                                            value={
                                                String(
                                                    classItem.id
                                                )
                                            }

                                        >

                                            {
                                                classItem.class_name
                                            }

                                        </option>

                                    )
                                )

                            }

                        </select>

                    </div>


                    {/* ARM */}

                    <div>

                        <label className="text-sm font-medium">

                            Arm

                        </label>

                        <select

                            value={armId}

                            onChange={(event) =>

                                setArmId(
                                    event.target.value
                                )

                            }

                            disabled={
                                !classId ||
                                isArmsLoading
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                All / No Arm

                            </option>

                            {

                                filteredArms.map(
                                    arm => (

                                        <option

                                            key={arm.id}

                                            value={
                                                String(
                                                    arm.id
                                                )
                                            }

                                        >

                                            {
                                                arm.arm_name
                                            }

                                        </option>

                                    )
                                )

                            }

                        </select>

                    </div>


                    {/* SESSION */}

                    <div>

                        <label className="text-sm font-medium">

                            Academic Session

                        </label>

                        <select

                            value={sessionId}

                            onChange={(event) => {

                                setSessionId(
                                    event.target.value
                                );

                                setTermId("");

                            }}

                            disabled={
                                isSessionsLoading
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                Select Session

                            </option>

                            {

                                sessions.map(
                                    session => (

                                        <option

                                            key={session.id}

                                            value={
                                                String(
                                                    session.id
                                                )
                                            }

                                        >

                                            {
                                                session.session_name
                                            }

                                        </option>

                                    )
                                )

                            }

                        </select>

                    </div>


                    {/* TERM */}

                    <div>

                        <label className="text-sm font-medium">

                            Term

                        </label>

                        <select

                            value={termId}

                            onChange={(event) =>

                                setTermId(
                                    event.target.value
                                )

                            }

                            disabled={
                                !sessionId ||
                                isTermsLoading
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                {

                                    !sessionId

                                        ? "Select Session First"

                                        : "Select Term"

                                }

                            </option>

                            {

                                filteredTerms.map(
                                    term => (

                                        <option

                                            key={term.id}

                                            value={
                                                String(
                                                    term.id
                                                )
                                            }

                                        >

                                            {
                                                term.term_name
                                            }

                                        </option>

                                    )
                                )

                            }

                        </select>

                    </div>

                </div>

            </div>


            {/* EMPTY STATE */}

            {

                (

                    !classId ||

                    !sessionId ||

                    !termId

                ) && (

                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">

                        Select a class, academic session,
                        and term to view the broadsheet.

                    </div>

                )

            }


            {/* LOADING */}

            {

                isLoading && (

                    <Loading
                        message="Loading class broadsheet..."
                    />

                )

            }


            {/* ERROR */}

            {

                error && (

                    <div className="rounded-lg border border-destructive p-4 text-destructive">

                        {

                            error.response?.data?.message ||

                            "Failed to load class broadsheet."

                        }

                    </div>

                )

            }


            {/* BROADSHEET */}

            {

                broadsheet && (

                    <>

                        {/* PRINT BUTTON */}

                        <div className="flex justify-end print:hidden">

                            <Button

                                type="button"

                                onClick={() =>
                                    window.print()
                                }

                            >

                                <Printer className="mr-2 h-4 w-4" />

                                Print Broadsheet

                            </Button>

                        </div>


                        {/* PRINTABLE AREA */}

                        <div className="printable-result">

                            <div className="rounded-xl border bg-background shadow-sm print:border-0 print:shadow-none">


                                {/* HEADER */}

                                <div className="border-b p-6">

                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                        <div>

                                            <h2 className="text-xl font-bold">

                                                Class Result Broadsheet

                                            </h2>

                                            <p className="mt-1 text-sm text-muted-foreground">

                                                {
                                                    broadsheet.class
                                                        .class_name
                                                }

                                                {

                                                    broadsheet.arm

                                                        ? ` - ${broadsheet.arm.arm_name}`

                                                        : ""

                                                }

                                            </p>

                                        </div>


                                        <div className="text-left md:text-right">

                                            <p className="font-semibold">

                                                {
                                                    broadsheet.session
                                                        .session_name
                                                }

                                            </p>

                                            <p className="text-sm text-muted-foreground">

                                                {
                                                    broadsheet.term
                                                        .term_name
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* TABLE */}

                                <div className="overflow-x-auto p-6">

                                    <table className="min-w-max w-full text-sm border-collapse">

                                        <thead>

                                            <tr className="bg-muted">

                                                <th className="border px-3 py-3 text-left">

                                                    S/N

                                                </th>

                                                <th className="border px-3 py-3 text-left">

                                                    Admission No.

                                                </th>

                                                <th className="border px-3 py-3 text-left">

                                                    Student Name

                                                </th>


                                                {/* DYNAMIC SUBJECTS */}

                                                {

                                                    broadsheet.subjects.map(
                                                        subject => (

                                                            <th

                                                                key={
                                                                    subject.id
                                                                }

                                                                className="border px-3 py-3 text-center whitespace-nowrap"

                                                            >

                                                                {
                                                                    subject.subject_name
                                                                }

                                                            </th>

                                                        )
                                                    )

                                                }


                                                <th className="border px-3 py-3 text-center">

                                                    Total

                                                </th>

                                                <th className="border px-3 py-3 text-center">

                                                    Average

                                                </th>

                                                <th className="border px-3 py-3 text-center">

                                                    Position

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {

                                                broadsheet.students.map(
                                                    (
                                                        student,
                                                        index
                                                    ) => (

                                                        <tr

                                                            key={
                                                                student.student_id
                                                            }

                                                        >

                                                            <td className="border px-3 py-3">

                                                                {
                                                                    index + 1
                                                                }

                                                            </td>


                                                            <td className="border px-3 py-3">

                                                                {
                                                                    student.admission_number
                                                                }

                                                            </td>


                                                            <td className="border px-3 py-3 font-medium whitespace-nowrap">

                                                                {
                                                                    student.student_name
                                                                }

                                                            </td>


                                                            {/* DYNAMIC SCORES */}

                                                            {

                                                                broadsheet.subjects.map(
                                                                    subject => (

                                                                        <td

                                                                            key={
                                                                                subject.id
                                                                            }

                                                                            className="border px-3 py-3 text-center"

                                                                        >

                                                                            {

                                                                                student.scores[
                                                                                    subject.id
                                                                                ] ?? "-"

                                                                            }

                                                                        </td>

                                                                    )
                                                                )

                                                            }


                                                            <td className="border px-3 py-3 text-center font-semibold">

                                                                {
                                                                    student.total_score
                                                                }

                                                            </td>


                                                            <td className="border px-3 py-3 text-center">

                                                                {
                                                                    Number(
                                                                        student.average_score
                                                                    ).toFixed(
                                                                        2
                                                                    )
                                                                }

                                                            </td>


                                                            <td className="border px-3 py-3 text-center font-semibold">

                                                                {
                                                                    formatPosition(
                                                                        student.overall_position
                                                                    )
                                                                }

                                                            </td>

                                                        </tr>

                                                    )
                                                )

                                            }

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    </>

                )

            }

        </div>

    );

}


export default ClassBroadsheetPage;