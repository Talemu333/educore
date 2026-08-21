import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

import { Printer } from "lucide-react";

import { useStudentResultReport } from "@/hooks/useStudentResultReport";

import Loading from "@/components/common/Loading";

import { useSessions } from "@/hooks/useSessions";

import { useTerms } from "@/hooks/useTerms";

import SchoolReportHeader from "@/components/results/SchoolReportHeader";

import ResultReportFooter from "@/components/results/ResultReportFooter";

import { useSchoolSettings } from "@/hooks/useSchoolSettings";


function StudentResultsTab({

    studentId

}) {


    /*
    =========================================
    SCHOOL SETTINGS
    =========================================
    */

    const {
        data: schoolSettings,
        isLoading: isSchoolSettingsLoading
    } = useSchoolSettings();


    const caMaxScore =
        Number(
            schoolSettings?.ca_max_score ?? 40
        );


    const examMaxScore =
        Number(
            schoolSettings?.exam_max_score ?? 60
        );


    const primaryColor =
        schoolSettings?.primary_color ||
        "#1D4ED8";


    /*
    =========================================
    SESSION
    =========================================
    */

    const [
        sessionId,
        setSessionId
    ] = useState("");


    const {

        data: sessions = [],

        isLoading: isSessionsLoading

    } = useSessions();


    /*
    =========================================
    TERMS
    =========================================
    */

    const {

        data: terms = [],

        isLoading: isTermsLoading

    } = useTerms();


    const filteredTerms = terms.filter(

        term =>

            Number(term.session_id) ===
            Number(sessionId)

    );


    const [
        termId,
        setTermId
    ] = useState("");


    /*
    =========================================
    STUDENT RESULT REPORT
    =========================================
    */

    const {

        data: report,

        isLoading,

        error

    } = useStudentResultReport(

        studentId,

        sessionId,

        termId

    );


    /*
    =========================================
    SET CURRENT SESSION / TERM
    =========================================
    */

    useEffect(() => {

        if (

            !sessionId &&

            !termId &&

            schoolSettings?.current_session_id &&

            schoolSettings?.current_term_id

        ) {

            setSessionId(

                String(
                    schoolSettings.current_session_id
                )

            );


            setTermId(

                String(
                    schoolSettings.current_term_id
                )

            );

        }

    }, [

        schoolSettings,

        sessionId,

        termId

    ]);


    /*
    =========================================
    FORMAT POSITION
    =========================================
    */

    const formatPosition = (position) => {

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


    return (

        <div className="space-y-6">


            {/* =========================================
                RESULT FILTER
            ========================================= */}

            <div className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">

                <div>

                    <h2 className="text-lg font-semibold text-foreground">

                        Student Results

                    </h2>


                    <p className="mt-1 text-sm text-muted-foreground">

                        Select an academic session and term
                        to view the student's results.

                    </p>

                </div>


                <div className="mt-5 grid gap-4 md:grid-cols-2">


                    {/* SESSION */}

                    <div className="min-w-0">

                        <label
                            htmlFor="student-result-session"
                            className="text-sm font-medium"
                        >

                            Academic Session

                        </label>


                        <select

                            id="student-result-session"

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

                            className="
                                mt-1
                                w-full
                                rounded-md
                                border
                                bg-background
                                px-3
                                py-2.5
                                text-sm
                                outline-none
                                transition
                                focus:ring-2
                                focus:ring-primary
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "

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

                                            key={
                                                session.id
                                            }

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

                    <div className="min-w-0">

                        <label
                            htmlFor="student-result-term"
                            className="text-sm font-medium"
                        >

                            Term

                        </label>


                        <select

                            id="student-result-term"

                            value={termId}

                            onChange={(event) => {

                                setTermId(
                                    event.target.value
                                );

                            }}

                            disabled={

                                !sessionId ||

                                isTermsLoading

                            }

                            className="
                                mt-1
                                w-full
                                rounded-md
                                border
                                bg-background
                                px-3
                                py-2.5
                                text-sm
                                outline-none
                                transition
                                focus:ring-2
                                focus:ring-primary
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "

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

                                            key={
                                                term.id
                                            }

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


            {/* =========================================
                NO SELECTION
            ========================================= */}

            {

                (!sessionId || !termId) && (

                    <div className="
                        rounded-xl
                        border
                        border-dashed
                        p-6
                        text-center
                        text-sm
                        text-muted-foreground
                        sm:p-8
                    ">

                        Select an academic session and term
                        to view results.

                    </div>

                )

            }


            {/* =========================================
                LOADING
            ========================================= */}

            {

                (isLoading ||
                    isSchoolSettingsLoading) && (

                    <Loading
                        message="Loading student results..."
                    />

                )

            }


            {/* =========================================
                ERROR
            ========================================= */}

            {

                error && (

                    <div className="
                        rounded-lg
                        border
                        border-destructive
                        p-4
                        text-sm
                        text-destructive
                    ">

                        Failed to load student results.

                    </div>

                )

            }


            {/* =========================================
                REPORT
            ========================================= */}

            {report && (

                <>


                    {/* =====================================
                        PRINT BUTTON
                    ===================================== */}

                    <div className="
                        mb-4
                        flex
                        justify-end
                        print:hidden
                    ">

                        <Button
                            type="button"
                            onClick={() =>
                                window.print()
                            }
                            className="w-full sm:w-auto"
                        >

                            <Printer className="mr-2 h-4 w-4" />

                            Print Result

                        </Button>

                    </div>


                    {/* =====================================
                        PRINTABLE RESULT
                    ===================================== */}

                    <div className="printable-result">


                        <div className="
                            overflow-hidden
                            rounded-xl
                            border
                            bg-background
                            shadow-sm
                            print:border-0
                            print:shadow-none
                        ">


                            {/* =================================
                                SCHOOL HEADER
                            ================================= */}

                            <SchoolReportHeader />


                            {/* =================================
                                REPORT HEADER
                            ================================= */}

                            <div className="
                                border-b
                                p-4
                                sm:p-6
                            ">

                                <div className="
                                    flex
                                    flex-col
                                    gap-4
                                    sm:gap-6
                                    md:flex-row
                                    md:items-start
                                    md:justify-between
                                ">


                                    <div className="min-w-0">

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-muted-foreground
                                            "
                                            style={{
                                                color:
                                                    primaryColor
                                            }}
                                        >

                                            Academic performance summary

                                        </p>

                                    </div>


                                    <div className="
                                        shrink-0
                                        text-left
                                        md:text-right
                                    ">

                                        <p className="font-semibold">

                                            {
                                                report
                                                    .academic
                                                    .session_name
                                            }

                                        </p>


                                        <p className="text-sm text-muted-foreground">

                                            {
                                                report
                                                    .academic
                                                    .term_name
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                STUDENT INFORMATION
                            ================================= */}

                            <div className="
                                border-b
                                bg-muted/30
                                p-4
                                sm:p-6
                            ">

                                <h3 className="
                                    mb-4
                                    text-sm
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-muted-foreground
                                ">

                                    Student Information

                                </h3>


                                <div className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                ">


                                    {/* NAME */}

                                    <div className="min-w-0">

                                        <p className="text-xs text-muted-foreground">

                                            Student Name

                                        </p>


                                        <p className="
                                            mt-1
                                            break-words
                                            font-semibold
                                        ">

                                            {
                                                report
                                                    .student
                                                    .name
                                            }

                                        </p>

                                    </div>


                                    {/* ADMISSION NUMBER */}

                                    <div className="min-w-0">

                                        <p className="text-xs text-muted-foreground">

                                            Admission Number

                                        </p>


                                        <p className="
                                            mt-1
                                            break-words
                                            font-semibold
                                        ">

                                            {
                                                report
                                                    .student
                                                    .admission_number
                                            }

                                        </p>

                                    </div>


                                    {/* CLASS */}

                                    <div>

                                        <p className="text-xs text-muted-foreground">

                                            Class

                                        </p>


                                        <p className="mt-1 font-semibold">

                                            {
                                                report
                                                    .student
                                                    .class_name
                                            }

                                        </p>

                                    </div>


                                    {/* ARM */}

                                    <div>

                                        <p className="text-xs text-muted-foreground">

                                            Arm

                                        </p>


                                        <p className="mt-1 font-semibold">

                                            {
                                                report
                                                    .student
                                                    .arm_name ||
                                                "-"
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                SUBJECT RESULTS
                            ================================= */}

                            <div className="
                                p-4
                                sm:p-6
                            ">

                                <h3
                                    className="
                                        mb-4
                                        text-lg
                                        font-semibold
                                    "
                                    style={{
                                        color:
                                            primaryColor
                                    }}
                                >

                                    Subject Results

                                </h3>


                                {/* IMPORTANT:
                                    Horizontal scrolling is
                                    intentionally retained for
                                    the results table on small
                                    screens.
                                */}

                                <div className="
                                    w-full
                                    overflow-x-auto
                                    rounded-lg
                                    border
                                ">

                                    <table className="
                                        min-w-[850px]
                                        w-full
                                        text-sm
                                    ">

                                        <thead className="bg-muted">

                                            <tr>

                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-left
                                                ">

                                                    S/N

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-left
                                                ">

                                                    Subject

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-center
                                                ">

                                                    CA

                                                    <br />

                                                    <span className="
                                                        text-xs
                                                        font-normal
                                                    ">

                                                        ({caMaxScore})

                                                    </span>

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-center
                                                ">

                                                    Exam

                                                    <br />

                                                    <span className="
                                                        text-xs
                                                        font-normal
                                                    ">

                                                        ({examMaxScore})

                                                    </span>

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-center
                                                ">

                                                    Total

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-center
                                                ">

                                                    Grade

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-center
                                                ">

                                                    Position

                                                </th>


                                                <th className="
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-left
                                                ">

                                                    Remark

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {

                                                report.results.map(

                                                    (
                                                        result,
                                                        index
                                                    ) => (

                                                        <tr
                                                            key={`${result.subject_name}-${index}`}
                                                            className="
                                                                border-t
                                                            "
                                                        >

                                                            <td className="
                                                                px-4
                                                                py-3
                                                            ">

                                                                {
                                                                    index + 1
                                                                }

                                                            </td>


                                                            <td className="
                                                                max-w-[220px]
                                                                px-4
                                                                py-3
                                                                font-medium
                                                            ">

                                                                {
                                                                    result.subject_name
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                                text-center
                                                            ">

                                                                {
                                                                    Number(
                                                                        result.ca_score
                                                                    )
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                                text-center
                                                            ">

                                                                {
                                                                    Number(
                                                                        result.exam_score
                                                                    )
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                                text-center
                                                                font-semibold
                                                            ">

                                                                {
                                                                    Number(
                                                                        result.total_score
                                                                    )
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                                text-center
                                                                font-bold
                                                            ">

                                                                {
                                                                    result.grade
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                                text-center
                                                            ">

                                                                {
                                                                    formatPosition(
                                                                        result.position
                                                                    )
                                                                }

                                                            </td>


                                                            <td className="
                                                                px-4
                                                                py-3
                                                            ">

                                                                {
                                                                    result.remark
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


                            {/* =================================
                                PERFORMANCE SUMMARY
                            ================================= */}

                            <div className="
                                border-t
                                bg-muted/20
                                p-4
                                sm:p-6
                            ">

                                <h3
                                    className="
                                        mb-4
                                        text-lg
                                        font-semibold
                                    "
                                    style={{
                                        color:
                                            primaryColor
                                    }}
                                >

                                    Performance Summary

                                </h3>


                                <div className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                ">


                                    {/* SUBJECTS */}

                                    <div className="
                                        rounded-lg
                                        border
                                        bg-background
                                        p-4
                                    ">

                                        <p className="text-sm text-muted-foreground">

                                            Number of Subjects

                                        </p>


                                        <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                        ">

                                            {
                                                report
                                                    .summary
                                                    .number_of_subjects
                                            }

                                        </p>

                                    </div>


                                    {/* TOTAL SCORE */}

                                    <div className="
                                        rounded-lg
                                        border
                                        bg-background
                                        p-4
                                    ">

                                        <p className="text-sm text-muted-foreground">

                                            Total Score

                                        </p>


                                        <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                        ">

                                            {
                                                Number(
                                                    report
                                                        .summary
                                                        .total_score
                                                )
                                            }

                                        </p>

                                    </div>


                                    {/* AVERAGE */}

                                    <div className="
                                        rounded-lg
                                        border
                                        bg-background
                                        p-4
                                    ">

                                        <p className="text-sm text-muted-foreground">

                                            Average Score

                                        </p>


                                        <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                        ">

                                            {
                                                Number(
                                                    report
                                                        .summary
                                                        .average_score
                                                ).toFixed(2)
                                            }

                                        </p>

                                    </div>


                                    {/* POSITION */}

                                    <div className="
                                        rounded-lg
                                        border
                                        bg-background
                                        p-4
                                    ">

                                        <p className="text-sm text-muted-foreground">

                                            Overall Position

                                        </p>


                                        <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                        ">

                                            {
                                                formatPosition(
                                                    report
                                                        .summary
                                                        .overall_position
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>


                                <ResultReportFooter />

                            </div>

                        </div>

                    </div>

                </>

            )}

        </div>

    );

}


export default StudentResultsTab;

// import {useEffect,useState} from "react";
// import { Button } from "@/components/ui/Button";
// import { Printer } from "lucide-react";

// import { useStudentResultReport } from "@/hooks/useStudentResultReport";

// import Loading from "@/components/common/Loading";
// import { useSessions } from "@/hooks/useSessions";
// import { useTerms } from "@/hooks/useTerms";
// import SchoolReportHeader from "@/components/results/SchoolReportHeader";
// import ResultReportFooter from "@/components/results/ResultReportFooter";
// import { useSchoolSettings } from "@/hooks/useSchoolSettings";

// function StudentResultsTab({

//     studentId

// }) {

//     const {
//         data: schoolSettings,
//         isLoading: isSchoolSettingsLoading
//     } = useSchoolSettings();

//     const caMaxScore =
//         Number(
//             schoolSettings?.ca_max_score ?? 40
//         );

//     const examMaxScore =
//         Number(
//             schoolSettings?.exam_max_score ?? 60
//         );

//     const primaryColor =
//         schoolSettings?.primary_color ||
//         "#1D4ED8";

//     const [

//         sessionId,

//         setSessionId

//     ] = useState("");

//     const {

//         data: sessions = [],

//         isLoading: isSessionsLoading

//     } = useSessions();

//     const {

//         data: terms = [],

//         isLoading: isTermsLoading

//     } = useTerms();

//     const filteredTerms = terms.filter(

//         term =>

//             Number(term.session_id) ===

//             Number(sessionId)

//     );

//     const [

//         termId,

//         setTermId

//     ] = useState("");

//     const {

//         data: report,

//         isLoading,

//         error

//     } = useStudentResultReport(

//         studentId,

//         sessionId,

//         termId

//     );

//     useEffect(() => {

//         if (

//             !sessionId &&

//             !termId &&

//             schoolSettings?.current_session_id &&

//             schoolSettings?.current_term_id

//         ) {

//             setSessionId(

//                 String(
//                     schoolSettings.current_session_id
//                 )

//             );

//             setTermId(

//                 String(
//                     schoolSettings.current_term_id
//                 )

//             );

//         }

//     }, [

//         schoolSettings,

//         sessionId,

//         termId

//     ]);

//     const formatPosition = (position) => {

//         if (
//             position === null ||
//             position === undefined
//         ) {

//             return "-";

//         }

//         const number = Number(position);

//         const lastTwoDigits = number % 100;

//         if (
//             lastTwoDigits >= 11 &&
//             lastTwoDigits <= 13
//         ) {

//             return `${number}th`;

//         }

//         switch (number % 10) {

//             case 1:
//                 return `${number}st`;

//             case 2:
//                 return `${number}nd`;

//             case 3:
//                 return `${number}rd`;

//             default:
//                 return `${number}th`;

//         }

//     };

//     return (

//         <div className="space-y-6">

//             <div className="rounded-lg border p-6">

//                 <h2 className="text-lg font-semibold">

//                     Student Results

//                 </h2>

//                 <p className="mt-1 text-sm text-muted-foreground">

//                     Select an academic session and term
//                     to view the student's results.

//                 </p>

//                 <div className="mt-4 grid gap-4 md:grid-cols-2">

//                     <div>

//                         <label className="text-sm font-medium">

//                             Academic Session

//                         </label>

//                         <select

//                             value={sessionId}

//                             onChange={(event) => {

//                                 setSessionId(

//                                     event.target.value

//                                 );

//                                 setTermId("");

//                             }}

//                             disabled={isSessionsLoading}

//                             className="mt-1 w-full rounded-md border px-3 py-2"

//                         >

//                             <option value="">

//                                 {

//                                     isSessionsLoading

//                                         ? "Loading sessions..."

//                                         : "Select Session"

//                                 }

//                             </option>

//                             {

//                                 sessions.map(

//                                     session => (

//                                         <option

//                                             key={session.id}

//                                             value={String(session.id)}

//                                         >

//                                             {session.session_name}

//                                         </option>

//                                     )

//                                 )

//                             }

//                         </select>

//                     </div>

//                     <div>

//                         <label className="text-sm font-medium">

//                             Term

//                         </label>

//                         <select

//                             value={termId}

//                             onChange={(event) => {

//                                 setTermId(

//                                     event.target.value

//                                 );

//                             }}

//                             disabled={

//                                 !sessionId ||

//                                 isTermsLoading

//                             }

//                             className="mt-1 w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"

//                         >

//                             <option value="">

//                                 {

//                                     !sessionId

//                                         ? "Select a session first"

//                                         : isTermsLoading

//                                             ? "Loading terms..."

//                                             : "Select Term"

//                                 }

//                             </option>

//                             {

//                                 filteredTerms.map(

//                                     term => (

//                                         <option

//                                             key={term.id}

//                                             value={String(term.id)}

//                                         >

//                                             {term.term_name}

//                                         </option>

//                                     )

//                                 )

//                             }

//                         </select>

//                     </div>

//                 </div>

//             </div>

//             {

//                 !sessionId ||

//                 !termId ? (

//                     <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">

//                         Select an academic session and term
//                         to view results.

//                     </div>

//                 ) : null

//             }

//             {

//                 (isLoading || isSchoolSettingsLoading) && (

//                     <Loading

//                         message="Loading student results..."

//                     />

//                 )

//             }

//             {

//                 error && (

//                     <div className="rounded-lg border border-destructive p-4 text-destructive">

//                         Failed to load student results.

//                     </div>

//                 )

//             }

//             {report && (

//                 <>

//                     {/* This button will NOT print */}

//                     <div className="flex justify-end mb-4 print:hidden">

//                         <Button
//                             type="button"
//                             onClick={() => window.print()}
//                         >

//                             <Printer className="mr-2 h-4 w-4" />

//                             Print Result

//                         </Button>

//                     </div>


//                     {/* ONLY THIS SECTION WILL PRINT */}

//                     <div className="printable-result">

//                         <div className="rounded-xl border bg-background shadow-sm print:border-0 print:shadow-none">

//                             {/* Your existing report content */}
//                             <SchoolReportHeader />

//                             <div className="border-b p-6">

//                             <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

//                                 <div>

//                                     <p className="mt-1 text-sm text-muted-foreground font-semibold" 
//                                         style={{
//                                             color: primaryColor
//                                         }}
//                                     >

//                                         Academic performance summary

//                                     </p>

//                                 </div>

//                                 <div className="text-left md:text-right">

//                                     <p className="font-semibold">

//                                         {report.academic.session_name}

//                                     </p>

//                                     <p className="text-sm text-muted-foreground">

//                                         {report.academic.term_name}

//                                     </p>

//                                 </div>

//                             </div>

//                         </div>


//                         {/* Student Information */}

//                         <div className="border-b bg-muted/30 p-6">

//                             <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">

//                                 Student Information

//                             </h3>

//                             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

//                                 <div>

//                                     <p className="text-xs text-muted-foreground">

//                                         Student Name

//                                     </p>

//                                     <p className="mt-1 font-semibold">

//                                         {report.student.name}

//                                     </p>

//                                 </div>

//                                 <div>

//                                     <p className="text-xs text-muted-foreground">

//                                         Admission Number

//                                     </p>

//                                     <p className="mt-1 font-semibold">

//                                         {report.student.admission_number}

//                                     </p>

//                                 </div>

//                                 <div>

//                                     <p className="text-xs text-muted-foreground">

//                                         Class

//                                     </p>

//                                     <p className="mt-1 font-semibold">

//                                         {report.student.class_name}

//                                     </p>

//                                 </div>

//                                 <div>

//                                     <p className="text-xs text-muted-foreground">

//                                         Arm

//                                     </p>

//                                     <p className="mt-1 font-semibold">

//                                         {report.student.arm_name || "-"}

//                                     </p>

//                                 </div>

//                             </div>

//                         </div>


//                         {/* Subject Results */}

//                         <div className="p-6">

//                             <h3
//                                 className="mb-4 text-lg font-semibold"
//                                 style={{
//                                     color: primaryColor
//                                 }}
//                             >

//                                 Subject Results

//                             </h3>

//                             <div className="overflow-x-auto rounded-lg border">

//                                 <table className="w-full text-sm">

//                                     <thead className="bg-muted">

//                                         <tr>

//                                             <th className="px-4 py-3 text-left">

//                                                 S/N

//                                             </th>

//                                             <th className="px-4 py-3 text-left">

//                                                 Subject

//                                             </th>

//                                             <th className="px-4 py-3 text-center">

//                                                 CA

//                                                 <br />

//                                                 <span className="text-xs font-normal">

//                                                     ({caMaxScore})

//                                                 </span>

//                                             </th>

//                                             <th className="px-4 py-3 text-center">

//                                                 Exam

//                                                 <br />

//                                                 <span className="text-xs font-normal">

//                                                     ({examMaxScore})

//                                                 </span>

//                                             </th>

//                                             <th className="px-4 py-3 text-center">

//                                                 Total

//                                             </th>

//                                             <th className="px-4 py-3 text-center">

//                                                 Grade

//                                             </th>

//                                             <th className="px-4 py-3 text-center">

//                                                 Position

//                                             </th>

//                                             <th className="px-4 py-3 text-left">

//                                                 Remark

//                                             </th>

//                                         </tr>

//                                     </thead>

//                                     <tbody>

//                                         {

//                                             report.results.map(

//                                                 (result, index) => (

//                                                     <tr

//                                                         key={`${result.subject_name}-${index}`}

//                                                         className="border-t"

//                                                     >

//                                                         <td className="px-4 py-3">

//                                                             {index + 1}

//                                                         </td>

//                                                         <td className="px-4 py-3 font-medium">

//                                                             {result.subject_name}

//                                                         </td>

//                                                         <td className="px-4 py-3 text-center">

//                                                             {Number(
//                                                                 result.ca_score
//                                                             )}

//                                                         </td>

//                                                         <td className="px-4 py-3 text-center">

//                                                             {Number(
//                                                                 result.exam_score
//                                                             )}

//                                                         </td>

//                                                         <td className="px-4 py-3 text-center font-semibold">

//                                                             {Number(
//                                                                 result.total_score
//                                                             )}

//                                                         </td>

//                                                         <td className="px-4 py-3 text-center font-bold">

//                                                             {result.grade}

//                                                         </td>

//                                                         <td className="px-4 py-3 text-center">

//                                                             {formatPosition(
//                                                                 result.position
//                                                             )}

//                                                         </td>

//                                                         <td className="px-4 py-3">

//                                                             {result.remark}

//                                                         </td>

//                                                     </tr>

//                                                 )

//                                             )

//                                         }

//                                     </tbody>

//                                 </table>

//                             </div>

//                         </div>


//                         {/* Performance Summary */}

//                         <div className="border-t bg-muted/20 p-6">

//                             <h3 className="mb-4 text-lg font-semibold"
//                                 style={{
//                                     color: primaryColor
//                                 }}
//                             >

//                                 Performance Summary

//                             </h3>

//                             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

//                                 <div className="rounded-lg border bg-background p-4">

//                                     <p className="text-sm text-muted-foreground">

//                                         Number of Subjects

//                                     </p>

//                                     <p className="mt-2 text-2xl font-bold">

//                                         {
//                                             report.summary
//                                                 .number_of_subjects
//                                         }

//                                     </p>

//                                 </div>

//                                 <div className="rounded-lg border bg-background p-4">

//                                     <p className="text-sm text-muted-foreground">

//                                         Total Score

//                                     </p>

//                                     <p className="mt-2 text-2xl font-bold">

//                                         {
//                                             Number(
//                                                 report.summary
//                                                     .total_score
//                                             )
//                                         }

//                                     </p>

//                                 </div>

//                                 <div className="rounded-lg border bg-background p-4">

//                                     <p className="text-sm text-muted-foreground">

//                                         Average Score

//                                     </p>

//                                     <p className="mt-2 text-2xl font-bold">

//                                         {
//                                             Number(
//                                                 report.summary
//                                                     .average_score
//                                             ).toFixed(2)
//                                         }

//                                     </p>

//                                 </div>

//                                 <div className="rounded-lg border bg-background p-4">

//                                     <p className="text-sm text-muted-foreground">

//                                         Overall Position

//                                     </p>

//                                     <p className="mt-2 text-2xl font-bold">

//                                         {formatPosition(
//                                             report.summary
//                                                 .overall_position
//                                         )}

//                                     </p>

//                                 </div>

//                             </div>

//                             <ResultReportFooter />

//                         </div>

                        

//                         </div>

//                     </div>

//                 </>

//             )}

            

//         </div>

//     );

// }

// export default StudentResultsTab;