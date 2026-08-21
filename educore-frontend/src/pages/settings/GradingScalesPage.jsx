import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import Loading from "@/components/common/Loading";

import { useGradingScales } from "@/hooks/useGradingScales";

import api from "@/api/axios";


function GradingScalesPage() {

    const {
        data: gradingScales = [],
        isLoading,
        refetch
    } = useGradingScales();


    const [formData, setFormData] = useState({

        grade: "",
        min_score: "",
        max_score: "",
        remark: ""

    });


    const [editingId, setEditingId] = useState(null);

    const [isSaving, setIsSaving] = useState(false);


    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(previous => ({

            ...previous,

            [name]: value

        }));

    };


    const resetForm = () => {

        setFormData({

            grade: "",
            min_score: "",
            max_score: "",
            remark: ""

        });

        setEditingId(null);

    };


    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!formData.grade.trim()) {

            toast.error("Grade is required.");

            return;

        }


        const minScore =
            Number(formData.min_score);

        const maxScore =
            Number(formData.max_score);


        if (
            Number.isNaN(minScore) ||
            Number.isNaN(maxScore)
        ) {

            toast.error(
                "Minimum and maximum scores must be numbers."
            );

            return;

        }


        if (minScore > maxScore) {

            toast.error(
                "Minimum score cannot be greater than maximum score."
            );

            return;

        }


        setIsSaving(true);


        try {

            const payload = {

                grade:
                    formData.grade
                        .trim()
                        .toUpperCase(),

                min_score:
                    minScore,

                max_score:
                    maxScore,

                remark:
                    formData.remark.trim()

            };


            if (editingId) {

                await api.put(

                    `/grading-scales/${editingId}`,

                    payload

                );

                toast.success(
                    "Grading scale updated successfully."
                );

            } else {

                await api.post(

                    "/grading-scales",

                    payload

                );

                toast.success(
                    "Grading scale created successfully."
                );

            }


            resetForm();

            await refetch();

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed to save grading scale."

            );

        } finally {

            setIsSaving(false);

        }

    };


    const handleEdit = (scale) => {

        setEditingId(scale.id);

        setFormData({

            grade:
                scale.grade || "",

            min_score:
                String(scale.min_score ?? ""),

            max_score:
                String(scale.max_score ?? ""),

            remark:
                scale.remark || ""

        });

    };


    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this grading scale?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(
                `/grading-scales/${id}`
            );


            toast.success(
                "Grading scale deleted successfully."
            );


            await refetch();

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed to delete grading scale."

            );

        }

    };


    if (isLoading) {

        return (

            <Loading
                message="Loading grading scales..."
            />

        );

    }


    return (

        <div className="space-y-6">

            <div>

                <h1 className="text-2xl font-bold">

                    Grading Scales

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    Configure the grades and remarks used when
                    calculating student results.

                </p>

            </div>


            {/* FORM */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <h2 className="text-lg font-semibold">

                    {editingId
                        ? "Edit Grading Scale"
                        : "Add Grading Scale"
                    }

                </h2>


                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                >

                    <div className="grid gap-4 md:grid-cols-4">

                        <div>

                            <label className="text-sm font-medium">

                                Grade

                            </label>

                            <input
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                placeholder="A"
                                maxLength={5}
                                className="mt-1 w-full rounded-md border px-3 py-2 uppercase"
                            />

                        </div>


                        <div>

                            <label className="text-sm font-medium">

                                Minimum Score

                            </label>

                            <input
                                type="number"
                                name="min_score"
                                value={formData.min_score}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                placeholder="70"
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />

                        </div>


                        <div>

                            <label className="text-sm font-medium">

                                Maximum Score

                            </label>

                            <input
                                type="number"
                                name="max_score"
                                value={formData.max_score}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                placeholder="100"
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />

                        </div>


                        <div>

                            <label className="text-sm font-medium">

                                Remark

                            </label>

                            <input
                                name="remark"
                                value={formData.remark}
                                onChange={handleChange}
                                placeholder="Excellent"
                                maxLength={100}
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />

                        </div>

                    </div>


                    <div className="flex justify-end gap-3">

                        {editingId && (

                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                            >

                                Cancel

                            </Button>

                        )}


                        <Button
                            type="submit"
                            disabled={isSaving}
                        >

                            <Plus className="mr-2 h-4 w-4" />

                            {isSaving

                                ? "Saving..."

                                : editingId
                                    ? "Update Grade"
                                    : "Add Grade"

                            }

                        </Button>

                    </div>

                </form>

            </div>


            {/* TABLE */}

            <div className="overflow-x-auto rounded-xl border">

                <table className="w-full text-sm">

                    <thead className="bg-muted">

                        <tr>

                            <th className="px-4 py-3 text-left">
                                S/N
                            </th>

                            <th className="px-4 py-3 text-left">
                                Grade
                            </th>

                            <th className="px-4 py-3 text-center">
                                Minimum
                            </th>

                            <th className="px-4 py-3 text-center">
                                Maximum
                            </th>

                            <th className="px-4 py-3 text-left">
                                Remark
                            </th>

                            <th className="px-4 py-3 text-center">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {gradingScales.map(
                            (scale, index) => (

                                <tr
                                    key={scale.id}
                                    className="border-t"
                                >

                                    <td className="px-4 py-3">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 font-bold">
                                        {scale.grade}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        {scale.min_score}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        {scale.max_score}
                                    </td>

                                    <td className="px-4 py-3">
                                        {scale.remark}
                                    </td>

                                    <td className="px-4 py-3">

                                        <div className="flex justify-center gap-2">

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(scale)
                                                }
                                            >

                                                <Pencil className="h-4 w-4" />

                                            </Button>


                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(scale.id)
                                                }
                                            >

                                                <Trash2 className="h-4 w-4" />

                                            </Button>

                                        </div>

                                    </td>

                                </tr>

                            )
                        )}


                        {!gradingScales.length && (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >

                                    No grading scales have been configured.

                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}


export default GradingScalesPage;