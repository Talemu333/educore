import { useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useSessions } from "@/hooks/useSessions";
import { useTerms } from "@/hooks/useTerms";
import { useClasses } from "@/hooks/useClasses";
import {useArmsByClass} from "@/hooks/useArmsByClass";

import { useClassResultSheet } from "@/hooks/useClassResultSheet";

import Loading from "@/components/common/Loading";
import SchoolReportHeader from "@/components/results/SchoolReportHeader";


function ClassResultSheetPage() {

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


    const {

        data: sessions = [],

        isLoading: isSessionsLoading

    } = useSessions();


    const {

        data: terms = [],

        isLoading: isTermsLoading

    } = useTerms();


    const {

        data: classes = [],

        isLoading: isClassesLoading

    } = useClasses();


    const {

        data: arms = [],

        isLoading: isArmsLoading

    } = useArmsByClass(classId);


    /*
        Only show terms belonging
        to the selected session
    */

    const filteredTerms = terms.filter(

        term =>

            Number(term.session_id) ===
            Number(sessionId)

    );


    /*
        Get the selected class and arm
        for displaying the heading
    */

    const selectedClass = classes.find(

        item =>

            Number(item.id) ===
            Number(classId)

    );


    const selectedArm = arms.find(

        item =>

            Number(item.id) ===
            Number(armId)

    );


    const {

        data: resultSheet,

        isLoading,

        error

    } = useClassResultSheet(

        classId,

        armId,

        sessionId,

        termId

    );


    const formatPosition = (

        position

    ) => {

        if (

            position === null ||

            position === undefined

        ) {

            return "-";

        }


        const number = Number(position);

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


    const canViewResult = Boolean(

        sessionId &&

        termId &&

        classId &&

        armId

    );


    return (

        <div className="space-y-6">


            {/* Page Heading */}

            <div>

                <h1 className="text-2xl font-bold">

                    Class Result Sheet

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    View the academic performance of
                    students in a class.

                </p>

            </div>


            {/* Filters */}

            <div className="rounded-lg border p-6 print:hidden">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                    {/* Session */}

                    <div>

                        <label className="text-sm font-medium">

                            Academic Session

                        </label>

                        <select

                            value={sessionId}

                            onChange={

                                (event) => {

                                    setSessionId(

                                        event.target.value

                                    );

                                    setTermId("");

                                }

                            }

                            disabled={isSessionsLoading}

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                {

                                    isSessionsLoading

                                        ? "Loading sessions..."

                                        : "Select Session"

                                }

                            </option>


                            {

                                sessions.map(

                                    session => (

                                        <option

                                            key={session.id}

                                            value={String(
                                                session.id
                                            )}

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


                    {/* Term */}

                    <div>

                        <label className="text-sm font-medium">

                            Term

                        </label>

                        <select

                            value={termId}

                            onChange={

                                (event) => {

                                    setTermId(

                                        event.target.value

                                    );

                                }

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

                                        ? "Select a session first"

                                        : isTermsLoading

                                            ? "Loading terms..."

                                            : "Select Term"

                                }

                            </option>


                            {

                                filteredTerms.map(

                                    term => (

                                        <option

                                            key={term.id}

                                            value={String(
                                                term.id
                                            )}

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


                    {/* Class */}

                    <div>

                        <label className="text-sm font-medium">

                            Class

                        </label>

                        <select

                            value={classId}

                            onChange={

                                (event) => {

                                    setClassId(

                                        event.target.value

                                    );

                                    setArmId("");

                                }

                            }

                            disabled={isClassesLoading}

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                {

                                    isClassesLoading

                                        ? "Loading classes..."

                                        : "Select Class"

                                }

                            </option>


                            {

                                classes.map(

                                    item => (

                                        <option

                                            key={item.id}

                                            value={String(
                                                item.id
                                            )}

                                        >

                                            {
                                                item.class_name
                                            }

                                        </option>

                                    )

                                )

                            }

                        </select>

                    </div>


                    {/* Arm */}

                    <div>

                        <label className="text-sm font-medium">

                            Arm

                        </label>

                        <select

                            value={armId}

                            onChange={

                                (event) => {

                                    setArmId(

                                        event.target.value

                                    );

                                }

                            }

                            disabled={

                                !classId ||

                                isArmsLoading

                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

                        >

                            <option value="">

                                {

                                    !classId

                                        ? "Select a class first"

                                        : isArmsLoading

                                            ? "Loading arms..."

                                            : "Select Arm"

                                }

                            </option>


                            {

                                arms.map(

                                    arm => (

                                        <option

                                            key={arm.id}

                                            value={String(
                                                arm.id
                                            )}

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

                </div>

            </div>


            {/* Initial Message */}

            {

                !canViewResult && (

                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">

                        Select the academic session,
                        term, class and arm to view
                        the class result sheet.

                    </div>

                )

            }


            {/* Loading */}

            {

                canViewResult &&

                isLoading && (

                    <Loading

                        message="Loading class result sheet..."

                    />

                )

            }


            {/* Error */}

            {

                canViewResult &&

                error && (

                    <div className="rounded-lg border border-destructive p-4 text-destructive">

                        Failed to load class result sheet.

                    </div>

                )

            }


            {/* Result Sheet */}

            {

                resultSheet && (

                    <>


                        {/* Print Button */}

                        <div className="flex justify-end print:hidden">

                            <Button

                                type="button"

                                onClick={() =>

                                    window.print()

                                }

                            >

                                <Printer className="mr-2 h-4 w-4" />

                                Print Result Sheet

                            </Button>

                        </div>


                        {/* Printable Area */}

                        <div className="printable-result">

                            <div className="rounded-xl border bg-background shadow-sm print:border-0 print:shadow-none">


                                {/* School Header */}

                                <SchoolReportHeader />


                                {/* Result Sheet Information */}

                                <div className="border-b p-6">

                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">


                                        <div>

                                            <h2 className="text-xl font-bold">

                                                Class Result Sheet

                                            </h2>

                                            <p className="mt-1 text-sm text-muted-foreground">

                                                Overall academic performance
                                                summary.

                                            </p>

                                        </div>


                                        <div className="text-left md:text-right">

                                            <p className="font-semibold">

                                                {
                                                    resultSheet
                                                        .session
                                                        ?.session_name
                                                }

                                            </p>

                                            <p className="text-sm text-muted-foreground">

                                                {
                                                    resultSheet
                                                        .term
                                                        ?.term_name
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Class Details */}

                                <div className="grid gap-4 border-b bg-muted/30 p-6 sm:grid-cols-3">

                                    <div>

                                        <p className="text-xs text-muted-foreground">

                                            Class

                                        </p>

                                        <p className="mt-1 font-semibold">

                                            {
                                                resultSheet
                                                    .class
                                                    ?.class_name ||

                                                selectedClass
                                                    ?.class_name ||

                                                "-"
                                            }

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-xs text-muted-foreground">

                                            Arm

                                        </p>

                                        <p className="mt-1 font-semibold">

                                            {
                                                selectedArm
                                                    ?.arm_name ||

                                                "-"
                                            }

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-xs text-muted-foreground">

                                            Number of Students

                                        </p>

                                        <p className="mt-1 font-semibold">

                                            {
                                                resultSheet
                                                    .results
                                                    ?.length || 0
                                            }

                                        </p>

                                    </div>

                                </div>


                                {/* Results Table */}

                                <div className="p-6">

                                    {

                                        !resultSheet.results?.length ? (

                                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">

                                                No results found for this
                                                class, session and term.

                                            </div>

                                        ) : (

                                            <div className="overflow-x-auto rounded-lg border">

                                                <table className="w-full text-sm">

                                                    <thead className="bg-muted">

                                                        <tr>

                                                            <th className="px-4 py-3 text-center">

                                                                S/N

                                                            </th>

                                                            <th className="px-4 py-3 text-left">

                                                                Admission No.

                                                            </th>

                                                            <th className="px-4 py-3 text-left">

                                                                Student Name

                                                            </th>

                                                            <th className="px-4 py-3 text-center">

                                                                Subjects

                                                            </th>

                                                            <th className="px-4 py-3 text-center">

                                                                Total Score

                                                            </th>

                                                            <th className="px-4 py-3 text-center">

                                                                Average

                                                            </th>

                                                            <th className="px-4 py-3 text-center">

                                                                Position

                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {

                                                            resultSheet.results.map(

                                                                (

                                                                    student,

                                                                    index

                                                                ) => (

                                                                    <tr

                                                                        key={
                                                                            student.student_id
                                                                        }

                                                                        className="border-t"

                                                                    >

                                                                        <td className="px-4 py-3 text-center">

                                                                            {
                                                                                index + 1
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3">

                                                                            {
                                                                                student
                                                                                    .admission_number
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3 font-medium">

                                                                            {
                                                                                student
                                                                                    .student_name
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3 text-center">

                                                                            {
                                                                                Number(
                                                                                    student
                                                                                        .number_of_subjects
                                                                                )
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3 text-center font-semibold">

                                                                            {
                                                                                Number(
                                                                                    student
                                                                                        .total_score
                                                                                )
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3 text-center">

                                                                            {
                                                                                Number(
                                                                                    student
                                                                                        .average_score
                                                                                ).toFixed(2)
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3 text-center font-bold">

                                                                            {
                                                                                formatPosition(
                                                                                    student
                                                                                        .overall_position
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

                                        )

                                    }

                                </div>

                            </div>

                        </div>

                    </>

                )

            }

        </div>

    );

}


export default ClassResultSheetPage;