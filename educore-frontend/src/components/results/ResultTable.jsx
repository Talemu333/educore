import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

import { useStudentsForResultEntry } from "@/hooks/useStudentsForResultEntry";
import { createBulkResults } from "@/services/resultService";
import {useGradingScales} from "@/hooks/useGradingScales";


function ResultTable({ assignment }) {

    const assignmentId = assignment?.id;

    const queryClient = useQueryClient();

    const {

        data: gradingScales = [],
        isLoading: isGradingScalesLoading

    } = useGradingScales();

    const {
        data: schoolSettings,
        isLoading: isSettingsLoading
    } = useSchoolSettings();

    const caMaxScore =
        Number(
            schoolSettings?.ca_max_score ?? 40
        );

    const examMaxScore =
        Number(
            schoolSettings?.exam_max_score ?? 60
        );

    const maximumTotalScore = caMaxScore + examMaxScore;

    const {
        data: students = [],
        isLoading
    } = useStudentsForResultEntry(assignmentId);

    const {
        control,
        register,
        reset,
        watch,
        setValue,
        handleSubmit
    } = useForm({

        defaultValues: {

            results: []

        }

    });

    const {
        fields
    } = useFieldArray({

        control,

        name: "results"

    });

    const results = watch("results");

    useEffect(() => {

        if (!students.length) {

            reset({

                results: []

            });

            return;

        }

        reset({

            results: students.map(student => ({

                student_id: student.id,

                admission_number:
                    student.admission_number,

                student_name:
                    student.student_name,

                ca_score: student.ca_score ?? "",
                exam_score: student.exam_score ?? "",
                total_score: student.total_score ?? "",
                grade: student.grade ?? "",
                remark: student.remark ?? "",
                position: student.position ?? ""

            }))

        });

    }, [

        students,

        reset

    ]);

    const saveMutation = useMutation({

        mutationFn: createBulkResults,

        onSuccess: async () => {

            await queryClient.invalidateQueries({

                queryKey: [

                    "results",

                    assignmentId

                ]

            });

            toast.success(
                "Results saved successfully."
            );

        },

        onError: (error) => {

            toast.error(

                error.response?.data?.message ||

                "Failed to save results."

            );

        }

    });

    const calculateResult = (index) => {

        const ca =

            Number(
                results?.[index]?.ca_score || 0
            );


        const exam =

            Number(
                results?.[index]?.exam_score || 0
            );


        const total =
            Math.min(
                ca + exam,
                caMaxScore + examMaxScore
            );


        const grading =

            gradingScales.find(

                scale =>

                    total >= Number(scale.min_score) &&

                    total <= Number(scale.max_score)

            );


        setValue(

            `results.${index}.total_score`,

            total

        );


        setValue(

            `results.${index}.grade`,

            grading?.grade || ""

        );


        setValue(

            `results.${index}.remark`,

            grading?.remark || ""

        );

    };

    const formatPosition = (position) => {

        if (position === null || position === undefined) {

            return "-";

        }

        const number = Number(position);

        const lastTwoDigits = number % 100;

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

    const onSubmit = (data) => {

        const hasEmptyScores =
            data.results.some(
                result =>

                    result.ca_score === "" ||
                    result.ca_score === null ||
                    result.exam_score === "" ||
                    result.exam_score === null
            );

        if (hasEmptyScores) {

            toast.error(
                "Please enter both CA and Exam scores for all students."
            );

            return;

        }

        const payload = {

            teacher_assignment_id:
                assignment.id,

            session_id:
                assignment.session_id,

            term_id:
                assignment.term_id,

            results: data.results.map(result => ({

                student_id:
                    Number(result.student_id),

                ca_score:
                    Number(result.ca_score),

                exam_score:
                    Number(result.exam_score)

            }))

        };

        saveMutation.mutate(payload);

    };

    if (!assignment) {

        return null;

    }

    if (

        isLoading ||

        isSettingsLoading ||

        isGradingScalesLoading

    ) {

        return (

            <p className="text-muted-foreground">

                Loading result information...

            </p>

        );

    }

    if (!students.length) {

        return (

            <div className="rounded-lg border p-6 text-center">

                <p className="font-medium">

                    No students found for this assignment.

                </p>

                <p className="text-sm text-muted-foreground mt-1">

                    Make sure students are enrolled in the
                    selected class and arm.

                </p>

            </div>

        );

    }

    return (

        <form

            onSubmit={handleSubmit(onSubmit)}

            className="space-y-4"

        >

            {/* Assignment Information */}

            <div className="rounded-lg border bg-muted/30 p-4">

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Session

                        </p>

                        <p className="font-medium">

                            {assignment.session_name}

                        </p>

                    </div>

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Term

                        </p>

                        <p className="font-medium">

                            {assignment.term_name}

                        </p>

                    </div>

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Class

                        </p>

                        <p className="font-medium">

                            {assignment.class_name}

                        </p>

                    </div>

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Arm

                        </p>

                        <p className="font-medium">

                            {assignment.arm_name || "-"}

                        </p>

                    </div>

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Subject

                        </p>

                        <p className="font-medium">

                            {assignment.subject_name}

                        </p>

                    </div>

                    <div>
                        <p className="text-sm">
                            Teacher
                        </p>

                        <p className="font-semibold">

                            {
                                assignment.teacher_name
                                    || "Not available"
                            }

                        </p>
                    </div>

                </div>

            </div>

            {/* Results Table */}

            <div className="overflow-x-auto rounded-lg border">

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

                                CA <br />

                                <span className="text-xs">

                                    ({caMaxScore})

                                </span>

                            </th>

                            <th className="px-4 py-3 text-center">

                                Exam <br />

                                <span className="text-xs">

                                    ({examMaxScore})

                                </span>

                            </th>

                            <th className="px-4 py-3 text-center">

                                Total

                            </th>

                            <th className="px-4 py-3 text-center">

                                Grade

                            </th>

                            <th className="px-4 py-3 text-left">

                                Remark

                            </th>

                            <th className="px-4 py-3 text-center">

                                Position

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {fields.map((field, index) => (

                            <tr

                                key={field.id}

                                className="border-t"

                            >

                                <td className="px-4 py-3">

                                    {index + 1}

                                </td>

                                <td className="px-4 py-3">

                                    {field.admission_number}

                                </td>

                                <td className="px-4 py-3 font-medium">

                                    {field.student_name}

                                </td>

                                <td className="px-2 py-2">

                                    <input

                                        type="number"

                                        min="0"

                                        max= {caMaxScore}

                                        step="1"

                                        {...register(

                                            `results.${index}.ca_score`,

                                            {
                                                 min: 0,

                                                max: caMaxScore,

                                                onChange: () =>

                                                    calculateResult(index)

                                            }

                                        )}

                                        className="w-20 rounded-md border px-2 py-1 text-center"

                                    />

                                </td>

                                <td className="px-2 py-2">

                                    <input

                                        type="number"

                                        min="0"

                                        max= {examMaxScore}

                                        step="1"

                                        {...register(

                                            `results.${index}.exam_score`,

                                            {
                                                min: 0,

                                                max: examMaxScore,

                                                onChange: () =>

                                                    calculateResult(index)

                                            }

                                        )}

                                        className="w-20 rounded-md border px-2 py-1 text-center"

                                    />

                                </td>

                                <td className="px-4 py-3 text-center font-semibold">

                                    {results?.[index]?.total_score ?? "-"}

                                </td>

                                <td className="px-4 py-3 text-center font-bold">

                                    {results?.[index]?.grade || "-"}

                                </td>

                                <td className="px-4 py-3">

                                    {results?.[index]?.remark || "-"}

                                </td>

                                <td className="px-4 py-3 text-center font-semibold">

                                    {formatPosition(
                                        results?.[index]?.position
                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Save Button */}

            <div className="flex justify-end">

                <Button

                    type="submit"

                    disabled={saveMutation.isPending}

                >

                    {saveMutation.isPending

                        ? "Saving Results..."

                        : "Save Results"

                    }

                </Button>

            </div>

        </form>

    );

}

export default ResultTable;