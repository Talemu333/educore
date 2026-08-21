import { useState } from "react";

import {
    useClasses
} from "@/hooks/useClasses";

import {
    useArmsByClass
} from "@/hooks/useArmsByClass";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useTerms
} from "@/hooks/useTerms";

import {
    useDetailedClassResultSheet
} from "@/hooks/useDetailedClassResultSheet";

import Loading from "@/components/common/Loading";

import { Button } from "@/components/ui/Button";

import {
    Printer
} from "lucide-react";


function DetailedClassResultSheetPage() {

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


    const {

        data: classes = []

    } = useClasses();


   const {
        data: arms = [],
        isLoading: isArmsLoading
    } = useArmsByClass(classId);


    const {

        data: sessions = []

    } = useSessions();


    const {

        data: terms = []

    } = useTerms();


    // const filteredArms = arms.filter(

    //     arm =>

    //         Number(arm.class_id) ===
    //         Number(classId)

    // );


    const filteredTerms = terms.filter(

        term =>

            Number(term.session_id) ===
            Number(sessionId)

    );


    const {

        data: resultSheet,

        isLoading,

        error

    } = useDetailedClassResultSheet({

        classId,

        armId,

        sessionId,

        termId

    });


    const formatPosition = (position) => {

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


        switch (number % 10) {

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


    const formatScore = (score) => {

        if (

            score === null ||

            score === undefined

        ) {

            return "-";

        }

        return Number(score);

    };


    return (

        <div className="space-y-6">


            {/* Page Header */}

            <div>

                <h1 className="text-2xl font-bold">

                    Detailed Class Result Sheet

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    View students' performance across
                    all subjects.

                </p>

            </div>


            {/* Filters */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                    {/* Class */}

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

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        >

                            <option value="">

                                Select Class

                            </option>

                            {

                                classes.map(

                                    item => (

                                        <option

                                            key={item.id}

                                            value={item.id}

                                        >

                                            {item.class_name}

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

                            onChange={(event) => {

                                setArmId(
                                    event.target.value
                                );

                            }}

                            disabled={!classId}

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

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

                                            value={arm.id}

                                        >

                                            {arm.arm_name}

                                        </option>

                                    )

                                )

                            }

                        </select>

                    </div>


                    {/* Session */}

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

                                            value={session.id}

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

                            onChange={(event) => {

                                setTermId(
                                    event.target.value
                                );

                            }}

                            disabled={!sessionId}

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

                        >

                            <option value="">

                                Select Term

                            </option>

                            {

                                filteredTerms.map(

                                    term => (

                                        <option

                                            key={term.id}

                                            value={term.id}

                                        >

                                            {term.term_name}

                                        </option>

                                    )

                                )

                            }

                        </select>

                    </div>

                </div>

            </div>


            {/* Empty State */}

            {

                (

                    !classId ||

                    !armId ||

                    !sessionId ||

                    !termId

                ) && (

                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">

                        Select a class, arm, academic
                        session, and term to view the
                        detailed result sheet.

                    </div>

                )

            }


            {/* Loading */}

            {

                isLoading && (

                    <Loading

                        message="Loading class result sheet..."

                    />

                )

            }


            {/* Error */}

            {

                error && (

                    <div className="rounded-lg border border-destructive p-4 text-destructive">

                        Failed to load the class result
                        sheet.

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


                        <div className="printable-result">

                            <div className="rounded-xl border bg-background shadow-sm print:border-0 print:shadow-none">


                                {/* Sheet Header */}

                                <div className="border-b p-6 text-center">

                                    <h2 className="text-2xl font-bold">

                                        Detailed Class Result Sheet

                                    </h2>

                                    <p className="mt-2 text-sm text-muted-foreground">

                                        {
                                            resultSheet.class
                                                .class_name
                                        }

                                        {" "}

                                        {

                                            resultSheet.arm
                                                ? `- ${resultSheet.arm.arm_name}`
                                                : ""

                                        }

                                    </p>

                                    <p className="text-sm text-muted-foreground">

                                        {
                                            resultSheet.session
                                                .session_name
                                        }

                                        {" • "}

                                        {
                                            resultSheet.term
                                                .term_name
                                        }

                                    </p>

                                </div>


                                {/* Result Table */}

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="sticky left-0 bg-muted px-4 py-3 text-left">

                                                    S/N

                                                </th>

                                                <th className="sticky left-12 bg-muted px-4 py-3 text-left">

                                                    Student Name

                                                </th>

                                                {

                                                    resultSheet.subjects.map(

                                                        subject => (

                                                            <th

                                                                key={subject.id}

                                                                className="px-4 py-3 text-center whitespace-nowrap"

                                                            >

                                                                {
                                                                    subject.subject_name
                                                                }

                                                            </th>

                                                        )

                                                    )

                                                }

                                                <th className="px-4 py-3 text-center">

                                                    Total

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

                                                resultSheet.students.map(

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

                                                            <td className="px-4 py-3">

                                                                {
                                                                    index + 1
                                                                }

                                                            </td>


                                                            <td className="px-4 py-3 font-medium whitespace-nowrap">

                                                                {
                                                                    student.student_name
                                                                }

                                                                <p className="text-xs font-normal text-muted-foreground">

                                                                    {
                                                                        student.admission_number
                                                                    }

                                                                </p>

                                                            </td>


                                                            {

                                                                resultSheet.subjects.map(

                                                                    subject => (

                                                                        <td

                                                                            key={subject.id}

                                                                            className="px-4 py-3 text-center"

                                                                        >

                                                                            {

                                                                                formatScore(

                                                                                    student.scores?.[

                                                                                        subject.id

                                                                                    ]

                                                                                )

                                                                            }

                                                                        </td>

                                                                    )

                                                                )

                                                            }


                                                            <td className="px-4 py-3 text-center font-semibold">

                                                                {

                                                                    formatScore(

                                                                        student.total_score

                                                                    )

                                                                }

                                                            </td>


                                                            <td className="px-4 py-3 text-center font-semibold">

                                                                {

                                                                    formatScore(

                                                                        student.average_score

                                                                    )

                                                                }

                                                            </td>


                                                            <td className="px-4 py-3 text-center font-bold">

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


                                {/* Summary */}

                                <div className="border-t p-6 text-sm text-muted-foreground">

                                    <p>

                                        Total Students:

                                        {" "}

                                        <span className="font-semibold text-foreground">

                                            {
                                                resultSheet.students.length
                                            }

                                        </span>

                                    </p>

                                    <p className="mt-1">

                                        Total Subjects:

                                        {" "}

                                        <span className="font-semibold text-foreground">

                                            {
                                                resultSheet.subjects.length
                                            }

                                        </span>

                                    </p>

                                </div>

                            </div>

                        </div>

                    </>

                )

            }

        </div>

    );

}


export default DetailedClassResultSheetPage;