import {
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
    useFeeTypes,
    useCreateFeeType,
    useUpdateFeeType,
    useDeleteFeeType
} from "@/hooks/useFeeTypes";

import {
    useFeeStructures,
    useCreateFeeStructure,
    useUpdateFeeStructure
} from "@/hooks/useFeeStructures";


function FeeManagementPage() {

    /*
    =========================================
    FEE TYPE FORM
    =========================================
    */

    const [
        feeTypeName,
        setFeeTypeName
    ] = useState("");

    const [
        feeTypeDescription,
        setFeeTypeDescription
    ] = useState("");

    const [
        editingFeeTypeId,
        setEditingFeeTypeId
    ] = useState(null);


    /*
    =========================================
    FEE STRUCTURE FORM
    =========================================
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
        feeTypeId,
        setFeeTypeId
    ] = useState("");

    const [
        amount,
        setAmount
    ] = useState("");

    const [
        editingFeeStructureId,
        setEditingFeeStructureId
    ] = useState(null);


    /*
    =========================================
    LOAD SESSIONS
    =========================================
    */

    const {
        data: sessions = [],
        isLoading: isSessionsLoading
    } = useSessions();


    /*
    =========================================
    LOAD TERMS
    =========================================
    */

    const {
        data: terms = [],
        isLoading: isTermsLoading
    } = useTerms();


    /*
    =========================================
    LOAD CLASSES
    =========================================
    */

    const {
        data: classes = [],
        isLoading: isClassesLoading
    } = useClasses();


    /*
    =========================================
    LOAD FEE TYPES
    =========================================
    */

    const {
        data: feeTypes = [],
        isLoading: isFeeTypesLoading
    } = useFeeTypes();


    /*
    =========================================
    LOAD FEE STRUCTURES
    =========================================
    */

    const {
        data: feeStructures = [],
        isLoading: isFeeStructuresLoading
    } = useFeeStructures();


    /*
    =========================================
    MUTATIONS
    =========================================
    */

    const createFeeTypeMutation =
        useCreateFeeType();

    const updateFeeTypeMutation =
        useUpdateFeeType();

    const deleteFeeTypeMutation =
        useDeleteFeeType();

    const createFeeStructureMutation =
        useCreateFeeStructure();

    const updateFeeStructureMutation =
        useUpdateFeeStructure();


    /*
    =========================================
    FILTER TERMS BY SESSION
    =========================================
    */

    const filteredTerms = useMemo(() => {

        if (!sessionId) {

            return terms;

        }

        return terms.filter(

            term =>
                String(term.session_id) ===
                String(sessionId)

        );

    }, [
        terms,
        sessionId
    ]);


    /*
    =========================================
    FILTER STRUCTURES
    =========================================
    */

    const filteredStructures = useMemo(() => {

        return feeStructures.filter(
            structure => {

                if (
                    sessionId &&
                    String(structure.session_id) !==
                    String(sessionId)
                ) {
                    return false;
                }

                if (
                    termId &&
                    String(structure.term_id) !==
                    String(termId)
                ) {
                    return false;
                }

                if (
                    classId &&
                    String(structure.class_id) !==
                    String(classId)
                ) {
                    return false;
                }

                return true;

            }
        );

    }, [
        feeStructures,
        sessionId,
        termId,
        classId
    ]);


    /*
    =========================================
    SELECTED TOTAL
    =========================================
    */

    const selectedTotal = useMemo(() => {

        if (
            !sessionId ||
            !termId ||
            !classId
        ) {

            return 0;

        }

        return feeStructures
            .filter(
                structure =>
                    String(structure.session_id) ===
                    String(sessionId) &&

                    String(structure.term_id) ===
                    String(termId) &&

                    String(structure.class_id) ===
                    String(classId)
            )
            .reduce(
                (
                    total,
                    structure
                ) =>
                    total +
                    Number(
                        structure.amount || 0
                    ),
                0
            );

    }, [
        feeStructures,
        sessionId,
        termId,
        classId
    ]);


    /*
    =========================================
    FORMAT CURRENCY
    =========================================
    */

    const formatCurrency = value => {

        return Number(
            value || 0
        ).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    /*
    =========================================
    RESET FEE TYPE FORM
    =========================================
    */

    const resetFeeTypeForm = () => {

        setFeeTypeName("");

        setFeeTypeDescription("");

        setEditingFeeTypeId(null);

    };


    /*
    =========================================
    RESET STRUCTURE FORM
    =========================================
    */

    const resetStructureForm = () => {

        setSessionId("");

        setTermId("");

        setClassId("");

        setFeeTypeId("");

        setAmount("");

        setEditingFeeStructureId(null);

    };


    /*
    =========================================
    SUBMIT FEE TYPE
    =========================================
    */

    const handleFeeTypeSubmit = async event => {

        event.preventDefault();

        if (!feeTypeName.trim()) {

            toast.error(
                "Fee name is required."
            );

            return;

        }

        try {

            if (editingFeeTypeId) {

                await updateFeeTypeMutation.mutateAsync({

                    id: editingFeeTypeId,

                    data: {

                        fee_name:
                            feeTypeName.trim(),

                        description:
                            feeTypeDescription.trim()

                    }

                });

                toast.success(
                    "Fee type updated successfully."
                );

            } else {

                await createFeeTypeMutation.mutateAsync({

                    fee_name:
                        feeTypeName.trim(),

                    description:
                        feeTypeDescription.trim()

                });

                toast.success(
                    "Fee type created successfully."
                );

            }

            resetFeeTypeForm();

        } catch (error) {

            toast.error(

                error
                    ?.response
                    ?.data
                    ?.message ||
                "Failed to save fee type."

            );

        }

    };


    /*
    =========================================
    EDIT FEE TYPE
    =========================================
    */

    const handleEditFeeType = feeType => {

        setEditingFeeTypeId(
            feeType.id
        );

        setFeeTypeName(
            feeType.fee_name
        );

        setFeeTypeDescription(
            feeType.description || ""
        );

    };


    /*
    =========================================
    DELETE FEE TYPE
    =========================================
    */

    const handleDeleteFeeType = async id => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this fee type?"
            );

        if (!confirmed) {

            return;

        }

        try {

            await deleteFeeTypeMutation.mutateAsync(
                id
            );

            toast.success(
                "Fee type deleted successfully."
            );

            if (
                editingFeeTypeId === id
            ) {

                resetFeeTypeForm();

            }

        } catch (error) {

            toast.error(

                error
                    ?.response
                    ?.data
                    ?.message ||
                "Failed to delete fee type."

            );

        }

    };


    /*
    =========================================
    SUBMIT FEE STRUCTURE
    =========================================
    */

    const handleFeeStructureSubmit =
        async event => {

            event.preventDefault();

            if (
                !sessionId ||
                !termId ||
                !classId ||
                !feeTypeId ||
                !amount
            ) {

                toast.error(
                    "Please complete all fee structure fields."
                );

                return;

            }

            if (
                Number(amount) <= 0
            ) {

                toast.error(
                    "Amount must be greater than zero."
                );

                return;

            }

            try {

                if (
                    editingFeeStructureId
                ) {

                    await updateFeeStructureMutation.mutateAsync({

                        id:
                            editingFeeStructureId,

                        data: {

                            amount:
                                Number(amount)

                        }

                    });

                    toast.success(
                        "Fee structure updated successfully."
                    );

                } else {

                    await createFeeStructureMutation.mutateAsync({

                        session_id:
                            Number(sessionId),

                        term_id:
                            Number(termId),

                        class_id:
                            Number(classId),

                        fee_type_id:
                            Number(feeTypeId),

                        amount:
                            Number(amount)

                    });

                    toast.success(
                        "Fee structure created successfully."
                    );

                }

                resetStructureForm();

            } catch (error) {

                toast.error(

                    error
                        ?.response
                        ?.data
                        ?.message ||
                    "Failed to save fee structure."

                );

            }

        };


    /*
    =========================================
    EDIT FEE STRUCTURE
    =========================================
    */

    const handleEditFeeStructure =
        structure => {

            setEditingFeeStructureId(
                structure.id
            );

            setSessionId(
                String(
                    structure.session_id
                )
            );

            setTermId(
                String(
                    structure.term_id
                )
            );

            setClassId(
                String(
                    structure.class_id
                )
            );

            setFeeTypeId(
                String(
                    structure.fee_type_id
                )
            );

            setAmount(
                String(
                    structure.amount
                )
            );

        };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (
        isSessionsLoading ||
        isTermsLoading ||
        isClassesLoading ||
        isFeeTypesLoading ||
        isFeeStructuresLoading
    ) {

        return (

            <Loading
                message="Loading fee management..."
            />

        );

    }


    /*
    =========================================
    RENDER
    =========================================
    */

    return (

        <div className="space-y-8">


            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div>

                <h1 className="text-2xl font-bold">

                    Fee Management

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    Configure fee types and assign
                    fees to classes for each academic
                    session and term.

                </p>

            </div>


            {/* =====================================
                FEE TYPES
            ===================================== */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-lg font-semibold">

                        Fee Types

                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Create the different categories
                        of fees charged by the school.

                    </p>

                </div>


                <div className="grid gap-6 lg:grid-cols-3">


                    {/* FORM */}

                    <form
                        onSubmit={
                            handleFeeTypeSubmit
                        }
                        className="space-y-4 rounded-lg border p-5"
                    >

                        <h3 className="font-semibold">

                            {
                                editingFeeTypeId
                                    ? "Edit Fee Type"
                                    : "Add Fee Type"
                            }

                        </h3>


                        <div>

                            <label className="text-sm font-medium">

                                Fee Name

                            </label>

                            <input

                                type="text"

                                value={
                                    feeTypeName
                                }

                                onChange={event =>
                                    setFeeTypeName(
                                        event.target.value
                                    )
                                }

                                placeholder="e.g. Tuition Fee"

                                className="mt-1 w-full rounded-md border px-3 py-2"

                            />

                        </div>


                        <div>

                            <label className="text-sm font-medium">

                                Description

                            </label>

                            <textarea

                                value={
                                    feeTypeDescription
                                }

                                onChange={event =>
                                    setFeeTypeDescription(
                                        event.target.value
                                    )
                                }

                                placeholder="Optional description"

                                rows={3}

                                className="mt-1 w-full rounded-md border px-3 py-2"

                            />

                        </div>


                        <div className="flex gap-2">

                            <Button
                                type="submit"
                                disabled={
                                    createFeeTypeMutation.isPending ||
                                    updateFeeTypeMutation.isPending
                                }
                            >

                                {
                                    editingFeeTypeId
                                        ? "Update Fee Type"
                                        : "Add Fee Type"
                                }

                            </Button>


                            {editingFeeTypeId && (

                                <Button

                                    type="button"

                                    variant="outline"

                                    onClick={
                                        resetFeeTypeForm
                                    }

                                >

                                    Cancel

                                </Button>

                            )}

                        </div>

                    </form>


                    {/* LIST */}

                    <div className="lg:col-span-2 overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-muted">

                                <tr>

                                    <th className="px-4 py-3 text-left">

                                        Fee Name

                                    </th>

                                    <th className="px-4 py-3 text-left">

                                        Description

                                    </th>

                                    <th className="px-4 py-3 text-right">

                                        Actions

                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {feeTypes.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="3"
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >

                                            No fee types created yet.

                                        </td>

                                    </tr>

                                ) : (

                                    feeTypes.map(
                                        feeType => (

                                            <tr
                                                key={
                                                    feeType.id
                                                }
                                                className="border-t"
                                            >

                                                <td className="px-4 py-3 font-medium">

                                                    {
                                                        feeType.fee_name
                                                    }

                                                </td>

                                                <td className="px-4 py-3 text-muted-foreground">

                                                    {
                                                        feeType.description ||
                                                        "—"
                                                    }

                                                </td>

                                                <td className="px-4 py-3">

                                                    <div className="flex justify-end gap-2">

                                                        <Button

                                                            type="button"

                                                            variant="outline"

                                                            size="sm"

                                                            onClick={() =>
                                                                handleEditFeeType(
                                                                    feeType
                                                                )
                                                            }

                                                        >

                                                            Edit

                                                        </Button>


                                                        <Button

                                                            type="button"

                                                            variant="destructive"

                                                            size="sm"

                                                            onClick={() =>
                                                                handleDeleteFeeType(
                                                                    feeType.id
                                                                )
                                                            }

                                                        >

                                                            Delete

                                                        </Button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* =====================================
                FEE STRUCTURE
            ===================================== */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-lg font-semibold">

                        Fee Structure

                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">

                        Assign individual fee amounts to
                        classes for each academic term.

                    </p>

                </div>


                {/* FORM */}

                <form
                    onSubmit={
                        handleFeeStructureSubmit
                    }
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                >


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
                                editingFeeStructureId
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

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

                            value={
                                termId
                            }

                            onChange={event =>
                                setTermId(
                                    event.target.value
                                )
                            }

                            disabled={
                                !sessionId ||
                                editingFeeStructureId
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

                        >

                            <option value="">

                                Select Term

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

                            value={
                                classId
                            }

                            onChange={event =>
                                setClassId(
                                    event.target.value
                                )
                            }

                            disabled={
                                editingFeeStructureId
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

                        >

                            <option value="">

                                Select Class

                            </option>

                            {classes.map(
                                schoolClass => (

                                    <option
                                        key={
                                            schoolClass.id
                                        }
                                        value={
                                            schoolClass.id
                                        }
                                    >

                                        {
                                            schoolClass.class_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* FEE TYPE */}

                    <div>

                        <label className="text-sm font-medium">

                            Fee Type

                        </label>

                        <select

                            value={
                                feeTypeId
                            }

                            onChange={event =>
                                setFeeTypeId(
                                    event.target.value
                                )
                            }

                            disabled={
                                editingFeeStructureId
                            }

                            className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"

                        >

                            <option value="">

                                Select Fee Type

                            </option>

                            {feeTypes.map(
                                feeType => (

                                    <option
                                        key={
                                            feeType.id
                                        }
                                        value={
                                            feeType.id
                                        }
                                    >

                                        {
                                            feeType.fee_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* AMOUNT */}

                    <div>

                        <label className="text-sm font-medium">

                            Amount (₦)

                        </label>

                        <input

                            type="number"

                            min="1"

                            step="0.01"

                            value={
                                amount
                            }

                            onChange={event =>
                                setAmount(
                                    event.target.value
                                )
                            }

                            placeholder="0.00"

                            className="mt-1 w-full rounded-md border px-3 py-2"

                        />

                    </div>


                    {/* BUTTON */}

                    <div className="flex items-end md:col-span-2 lg:col-span-5">

                        <div className="flex gap-2">

                            <Button

                                type="submit"

                                disabled={
                                    createFeeStructureMutation.isPending ||
                                    updateFeeStructureMutation.isPending
                                }

                            >

                                {
                                    editingFeeStructureId
                                        ? "Update Amount"
                                        : "Add Fee"
                                }

                            </Button>


                            {editingFeeStructureId && (

                                <Button

                                    type="button"

                                    variant="outline"

                                    onClick={
                                        resetStructureForm
                                    }

                                >

                                    Cancel

                                </Button>

                            )}

                        </div>

                    </div>

                </form>


                {/* TOTAL */}

                <div className="mt-6 rounded-lg border bg-muted/30 p-5">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-sm text-muted-foreground">

                                Total Fee for Selected
                                Class / Term

                            </p>

                            <p className="text-xs text-muted-foreground">

                                Select a session, term and
                                class to view the total.

                            </p>

                        </div>

                        <p className="text-2xl font-bold">

                            ₦
                            {
                                formatCurrency(
                                    selectedTotal
                                )
                            }

                        </p>

                    </div>

                </div>


                {/* STRUCTURES TABLE */}

                <div className="mt-6 overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-muted">

                            <tr>

                                <th className="px-4 py-3 text-left">

                                    Session

                                </th>

                                <th className="px-4 py-3 text-left">

                                    Term

                                </th>

                                <th className="px-4 py-3 text-left">

                                    Class

                                </th>

                                <th className="px-4 py-3 text-left">

                                    Fee Type

                                </th>

                                <th className="px-4 py-3 text-right">

                                    Amount

                                </th>

                                <th className="px-4 py-3 text-right">

                                    Action

                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredStructures.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >

                                        No fee structures found.

                                    </td>

                                </tr>

                            ) : (

                                filteredStructures.map(
                                    structure => (

                                        <tr
                                            key={
                                                structure.id
                                            }
                                            className="border-t"
                                        >

                                            <td className="px-4 py-3">

                                                {
                                                    structure.session_name
                                                }

                                            </td>

                                            <td className="px-4 py-3">

                                                {
                                                    structure.term_name
                                                }

                                            </td>

                                            <td className="px-4 py-3">

                                                {
                                                    structure.class_name
                                                }

                                            </td>

                                            <td className="px-4 py-3 font-medium">

                                                {
                                                    structure.fee_name
                                                }

                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold">

                                                ₦
                                                {
                                                    formatCurrency(
                                                        structure.amount
                                                    )
                                                }

                                            </td>

                                            <td className="px-4 py-3 text-right">

                                                <Button

                                                    type="button"

                                                    variant="outline"

                                                    size="sm"

                                                    onClick={() =>
                                                        handleEditFeeStructure(
                                                            structure
                                                        )
                                                    }

                                                >

                                                    Edit

                                                </Button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}


export default FeeManagementPage;