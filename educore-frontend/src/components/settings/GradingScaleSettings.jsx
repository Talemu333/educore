import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useGradingScales } from "@/hooks/useGradingScales";

import {
    useCreateGradingScale,
    useUpdateGradingScale,
    useDeleteGradingScale
} from "@/hooks/useGradingScaleMutations";


function GradingScaleSettings() {

    const {
        data: gradingScales = [],
        isLoading
    } = useGradingScales();


    const createMutation =
        useCreateGradingScale();

    const updateMutation =
        useUpdateGradingScale();

    const deleteMutation =
        useDeleteGradingScale();


    const [showForm, setShowForm] =
        useState(false);


    const [editingId, setEditingId] =
        useState(null);


    const [formData, setFormData] = useState({

        grade: "",

        min_score: "",

        max_score: "",

        remark: ""

    });


    const resetForm = () => {

        setFormData({

            grade: "",

            min_score: "",

            max_score: "",

            remark: ""

        });

        setEditingId(null);

        setShowForm(false);

    };


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


    const handleEdit = (scale) => {

        setEditingId(scale.id);

        setFormData({

            grade:
                scale.grade || "",

            min_score:
                scale.min_score?.toString() || "",

            max_score:
                scale.max_score?.toString() || "",

            remark:
                scale.remark || ""

        });

        setShowForm(true);

    };


    const handleSubmit = (event) => {

        event.preventDefault();


        const minScore =
            Number(formData.min_score);

        const maxScore =
            Number(formData.max_score);


        if (minScore > maxScore) {

            toast.error(
                "Minimum score cannot be greater than maximum score."
            );

            return;

        }


        if (
            minScore < 0 ||
            maxScore > 100
        ) {

            toast.error(
                "Scores must be between 0 and 100."
            );

            return;

        }


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

            updateMutation.mutate(

                {

                    id: editingId,

                    data: payload

                },

                {

                    onSuccess: () => {

                        toast.success(
                            "Grading scale updated successfully."
                        );

                        resetForm();

                    },

                    onError: (error) => {

                        toast.error(

                            error.response?.data?.message ||

                            "Failed to update grading scale."

                        );

                    }

                }

            );

            return;

        }


        createMutation.mutate(

            payload,

            {

                onSuccess: () => {

                    toast.success(
                        "Grading scale created successfully."
                    );

                    resetForm();

                },

                onError: (error) => {

                    toast.error(

                        error.response?.data?.message ||

                        "Failed to create grading scale."

                    );

                }

            }

        );

    };


    const handleDelete = (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this grading scale?"
            );


        if (!confirmed) {

            return;

        }


        deleteMutation.mutate(

            id,

            {

                onSuccess: () => {

                    toast.success(
                        "Grading scale deleted successfully."
                    );

                },

                onError: (error) => {

                    toast.error(

                        error.response?.data?.message ||

                        "Failed to delete grading scale."

                    );

                }

            }

        );

    };


    const isSaving =
        createMutation.isPending ||
        updateMutation.isPending;


    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h2 className="text-lg font-semibold">

                        Grading Scale

                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Configure how students' total scores
                        are converted into grades.

                    </p>

                </div>


                <Button

                    type="button"

                    onClick={() => {

                        setEditingId(null);

                        setFormData({

                            grade: "",

                            min_score: "",

                            max_score: "",

                            remark: ""

                        });

                        setShowForm(true);

                    }}

                >

                    <Plus className="mr-2 h-4 w-4" />

                    Add Grade

                </Button>

            </div>


            {/* Form */}

            {showForm && (

                <form

                    onSubmit={handleSubmit}

                    className="
                        rounded-xl
                        border
                        bg-muted/20
                        p-6
                    "

                >

                    <h3 className="font-semibold">

                        {editingId
                            ? "Edit Grading Scale"
                            : "Add Grading Scale"
                        }

                    </h3>


                    <div className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                    ">


                        {/* Grade */}

                        <div>

                            <label className="
                                text-sm
                                font-medium
                            ">

                                Grade

                            </label>


                            <input

                                name="grade"

                                value={
                                    formData.grade
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="A"

                                maxLength={5}

                                required

                                className="
                                    mt-1
                                    w-full
                                    rounded-md
                                    border
                                    px-3
                                    py-2
                                "

                            />

                        </div>


                        {/* Remark */}

                        <div>

                            <label className="
                                text-sm
                                font-medium
                            ">

                                Remark

                            </label>


                            <input

                                name="remark"

                                value={
                                    formData.remark
                                }

                                onChange={
                                    handleChange
                                }

                                placeholder="Excellent"

                                maxLength={100}

                                required

                                className="
                                    mt-1
                                    w-full
                                    rounded-md
                                    border
                                    px-3
                                    py-2
                                "

                            />

                        </div>


                        {/* Minimum */}

                        <div>

                            <label className="
                                text-sm
                                font-medium
                            ">

                                Minimum Score

                            </label>


                            <input

                                type="number"

                                name="min_score"

                                value={
                                    formData.min_score
                                }

                                onChange={
                                    handleChange
                                }

                                min="0"

                                max="100"

                                step="0.01"

                                required

                                className="
                                    mt-1
                                    w-full
                                    rounded-md
                                    border
                                    px-3
                                    py-2
                                "

                            />

                        </div>


                        {/* Maximum */}

                        <div>

                            <label className="
                                text-sm
                                font-medium
                            ">

                                Maximum Score

                            </label>


                            <input

                                type="number"

                                name="max_score"

                                value={
                                    formData.max_score
                                }

                                onChange={
                                    handleChange
                                }

                                min="0"

                                max="100"

                                step="0.01"

                                required

                                className="
                                    mt-1
                                    w-full
                                    rounded-md
                                    border
                                    px-3
                                    py-2
                                "

                            />

                        </div>

                    </div>


                    <div className="
                        mt-5
                        flex
                        justify-end
                        gap-3
                    ">

                        <Button

                            type="button"

                            variant="outline"

                            onClick={resetForm}

                            disabled={isSaving}

                        >

                            Cancel

                        </Button>


                        <Button

                            type="submit"

                            disabled={isSaving}

                        >

                            {isSaving

                                ? "Saving..."

                                : editingId
                                    ? "Update Grade"
                                    : "Save Grade"

                            }

                        </Button>

                    </div>

                </form>

            )}


            {/* Table */}

            <div className="overflow-x-auto rounded-xl border">

                <table className="w-full text-sm">

                    <thead className="bg-muted">

                        <tr>

                            <th className="
                                px-4
                                py-3
                                text-left
                            ">

                                Grade

                            </th>

                            <th className="
                                px-4
                                py-3
                                text-center
                            ">

                                Minimum Score

                            </th>

                            <th className="
                                px-4
                                py-3
                                text-center
                            ">

                                Maximum Score

                            </th>

                            <th className="
                                px-4
                                py-3
                                text-left
                            ">

                                Remark

                            </th>

                            <th className="
                                px-4
                                py-3
                                text-right
                            ">

                                Actions

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {isLoading ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="
                                        px-4
                                        py-8
                                        text-center
                                        text-muted-foreground
                                    "
                                >

                                    Loading grading scales...

                                </td>

                            </tr>

                        ) : gradingScales.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="
                                        px-4
                                        py-8
                                        text-center
                                        text-muted-foreground
                                    "
                                >

                                    No grading scales found.

                                </td>

                            </tr>

                        ) : (

                            gradingScales.map(scale => (

                                <tr
                                    key={scale.id}
                                    className="border-t"
                                >

                                    <td className="
                                        px-4
                                        py-3
                                        font-bold
                                    ">

                                        {scale.grade}

                                    </td>


                                    <td className="
                                        px-4
                                        py-3
                                        text-center
                                    ">

                                        {Number(
                                            scale.min_score
                                        )}

                                    </td>


                                    <td className="
                                        px-4
                                        py-3
                                        text-center
                                    ">

                                        {Number(
                                            scale.max_score
                                        )}

                                    </td>


                                    <td className="
                                        px-4
                                        py-3
                                    ">

                                        {scale.remark}

                                    </td>


                                    <td className="
                                        px-4
                                        py-3
                                    ">

                                        <div className="
                                            flex
                                            justify-end
                                            gap-2
                                        ">

                                            <Button

                                                type="button"

                                                variant="outline"

                                                size="sm"

                                                onClick={() =>
                                                    handleEdit(scale)
                                                }

                                            >

                                                <Pencil className="
                                                    h-4
                                                    w-4
                                                    mr-1
                                                " />

                                                Edit

                                            </Button>


                                            <Button

                                                type="button"

                                                variant="destructive"

                                                size="sm"

                                                onClick={() =>
                                                    handleDelete(
                                                        scale.id
                                                    )
                                                }

                                                disabled={
                                                    deleteMutation.isPending
                                                }

                                            >

                                                <Trash2 className="
                                                    h-4
                                                    w-4
                                                    mr-1
                                                " />

                                                Delete

                                            </Button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}


export default GradingScaleSettings;