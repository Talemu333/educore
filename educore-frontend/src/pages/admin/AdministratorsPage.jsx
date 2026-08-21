import {
    useState
} from "react";

import {
    useAdministrators
} from "@/hooks/useAdministrators";

import {
    useCreateAdministrator
} from "@/hooks/useCreateAdministrator";

import {
    useActivateAdministrator
} from "@/hooks/useActivateAdministrator";

import {
    useDeactivateAdministrator
} from "@/hooks/useDeactivateAdministrator";

import Loading
    from "@/components/common/Loading";

import {
    Button
} from "@/components/ui/button";

import toast
    from "react-hot-toast";

import {
    Plus,
    ShieldCheck,
    ShieldOff
} from "lucide-react";


function AdministratorsPage() {

    /*
    =========================================
    GET ADMINISTRATORS
    =========================================
    */

    const {
        data: administrators = [],
        isLoading
    } = useAdministrators();


    /*
    =========================================
    CREATE
    =========================================
    */

    const {
        mutate: createAdministrator,
        isPending: isCreating
    } =
        useCreateAdministrator();


    /*
    =========================================
    ACTIVATE
    =========================================
    */

    const {
        mutate: activateAdministrator,
        isPending: isActivating
    } =
        useActivateAdministrator();


    /*
    =========================================
    DEACTIVATE
    =========================================
    */

    const {
        mutate: deactivateAdministrator,
        isPending: isDeactivating
    } =
        useDeactivateAdministrator();


    /*
    =========================================
    FORM VISIBILITY
    =========================================
    */

    const [
        showCreateForm,
        setShowCreateForm
    ] = useState(false);


    /*
    =========================================
    FORM STATE
    =========================================
    */

    const [
        formData,
        setFormData
    ] = useState({

        username: "",

        email: "",

        password: "",

        admin_type: "principal"

    });


    /*
    =========================================
    SELECTED ADMINISTRATOR
    =========================================
    */

    const [
        selectedAdminId,
        setSelectedAdminId
    ] = useState(null);


    /*
    =========================================
    HANDLE INPUT
    =========================================
    */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    /*
    =========================================
    RESET FORM
    =========================================
    */

    const resetForm = () => {

        setFormData({

            username: "",

            email: "",

            password: "",

            admin_type: "principal"

        });

    };


    /*
    =========================================
    CREATE ADMINISTRATOR
    =========================================
    */

    const handleCreate = (event) => {

        event.preventDefault();


        if (
            !formData.username.trim()
        ) {

            toast.error(
                "Username is required."
            );

            return;

        }


        if (
            !formData.password
        ) {

            toast.error(
                "Password is required."
            );

            return;

        }


        createAdministrator(

            {

                username:
                    formData.username.trim(),

                email:
                    formData.email.trim() ||
                    null,

                password:
                    formData.password,

                admin_type:
                    formData.admin_type

            },

            {

                onSuccess: () => {

                    toast.success(
                        "Administrator account created successfully."
                    );


                    resetForm();

                    setShowCreateForm(
                        false
                    );

                },


                onError: (error) => {

                    toast.error(

                        error.response?.data?.message ||
                        "Failed to create administrator."

                    );

                }

            }

        );

    };


    /*
    =========================================
    ACTIVATE
    =========================================
    */

    const handleActivate = (
        administrator
    ) => {

        setSelectedAdminId(
            administrator.id
        );


        activateAdministrator(

            administrator.id,

            {

                onSuccess: () => {

                    toast.success(

                        `${administrator.username} has been activated.`

                    );

                    setSelectedAdminId(
                        null
                    );

                },


                onError: (error) => {

                    toast.error(

                        error.response?.data?.message ||
                        "Failed to activate administrator."

                    );

                    setSelectedAdminId(
                        null
                    );

                }

            }

        );

    };


    /*
    =========================================
    DEACTIVATE
    =========================================
    */

    const handleDeactivate = (
        administrator
    ) => {

        const confirmed =
            window.confirm(

                `Are you sure you want to deactivate ${administrator.username}?`

            );


        if (!confirmed) {

            return;

        }


        setSelectedAdminId(
            administrator.id
        );


        deactivateAdministrator(

            administrator.id,

            {

                onSuccess: () => {

                    toast.success(

                        `${administrator.username} has been deactivated.`

                    );

                    setSelectedAdminId(
                        null
                    );

                },


                onError: (error) => {

                    toast.error(

                        error.response?.data?.message ||
                        "Failed to deactivate administrator."

                    );

                    setSelectedAdminId(
                        null
                    );

                }

            }

        );

    };


    /*
    =========================================
    FORMAT ADMIN TYPE
    =========================================
    */

    const formatAdminType = (
        adminType
    ) => {

        if (!adminType) {

            return "—";

        }


        return adminType
            .split("_")
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase() +
                    word.slice(1)
            )
            .join(" ");

    };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (isLoading) {

        return (

            <Loading
                message="Loading administrators..."
            />

        );

    }


    return (

        <div className="space-y-6">


            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div>

                    <h1
                        className="
                            text-2xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Administrators
                    </h1>


                    <p
                        className="
                            mt-1
                            text-sm
                            text-muted-foreground
                        "
                    >
                        Manage school administrator accounts.
                    </p>

                </div>


                <Button
                    type="button"
                    onClick={() =>
                        setShowCreateForm(
                            previous => !previous
                        )
                    }
                    className="
                        w-full
                        sm:w-auto
                    "
                >

                    <Plus
                        className="
                            mr-2
                            h-4
                            w-4
                        "
                    />

                    Add Administrator

                </Button>

            </div>


            {/* =====================================
                CREATE FORM
            ===================================== */}

            {showCreateForm && (

                <div
                    className="
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <div
                        className="
                            mb-6
                        "
                    >

                        <h2
                            className="
                                text-lg
                                font-semibold
                            "
                        >
                            Create Administrator
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-muted-foreground
                            "
                        >
                            Create a new administrator account for the school.
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleCreate
                        }
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        "
                    >


                        {/* USERNAME */}

                        <div>

                            <label
                                htmlFor="username"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                "
                            >
                                Username
                            </label>


                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={
                                    formData.username
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter username"
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary
                                "
                            />

                        </div>


                        {/* EMAIL */}

                        <div>

                            <label
                                htmlFor="email"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                "
                            >
                                Email
                            </label>


                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="administrator@school.com"
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary
                                "
                            />

                        </div>


                        {/* ADMIN TYPE */}

                        <div>

                            <label
                                htmlFor="admin_type"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                "
                            >
                                Administrator Type
                            </label>


                            <select
                                id="admin_type"
                                name="admin_type"
                                value={
                                    formData.admin_type
                                }
                                onChange={
                                    handleChange
                                }
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary
                                "
                            >

                                <option value="principal">
                                    Principal
                                </option>

                                <option value="vice_principal">
                                    Vice Principal
                                </option>

                                <option value="bursar">
                                    Bursar
                                </option>

                                <option value="librarian">
                                    Librarian
                                </option>

                            </select>

                        </div>


                        {/* PASSWORD */}

                        <div>

                            <label
                                htmlFor="password"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                "
                            >
                                Temporary Password
                            </label>


                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter temporary password"
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary
                                "
                            />

                        </div>


                        {/* FORM ACTIONS */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                sm:flex-row
                                md:col-span-2
                            "
                        >

                            <Button
                                type="submit"
                                disabled={
                                    isCreating
                                }
                                className="
                                    w-full
                                    sm:w-auto
                                "
                            >

                                {isCreating
                                    ? "Creating..."
                                    : "Create Administrator"
                                }

                            </Button>


                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    isCreating
                                }
                                className="
                                    w-full
                                    sm:w-auto
                                "
                                onClick={() => {

                                    resetForm();

                                    setShowCreateForm(
                                        false
                                    );

                                }}
                            >
                                Cancel
                            </Button>

                        </div>

                    </form>

                </div>

            )}


            {/* =====================================
                ADMINISTRATORS CARD
            ===================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    bg-background
                    shadow-sm
                "
            >

                {/* CARD HEADER */}

                <div
                    className="
                        border-b
                        px-4
                        py-4
                        sm:px-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div className="min-w-0">

                            <h2
                                className="
                                    font-semibold
                                "
                            >
                                Administrators
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-muted-foreground
                                "
                            >
                                Proprietor and other school administrators
                            </p>

                        </div>


                        <div
                            className="
                                shrink-0
                                rounded-full
                                bg-muted
                                px-3
                                py-1
                                text-xs
                                font-medium
                            "
                        >
                            {
                                administrators.length
                            }
                        </div>

                    </div>

                </div>


                {/* =====================================
                    MOBILE ADMINISTRATOR CARDS
                ===================================== */}

                <div
                    className="
                        divide-y
                        md:hidden
                    "
                >

                    {administrators.length === 0 ? (

                        <div
                            className="
                                px-4
                                py-12
                                text-center
                                text-sm
                                text-muted-foreground
                            "
                        >
                            No administrators found.
                        </div>

                    ) : (

                        administrators.map(
                            administrator => {

                                const isProcessing =
                                    selectedAdminId ===
                                    administrator.id;


                                const adminType =
                                    administrator
                                        .admin_type
                                        ?.toLowerCase();


                                const isProprietor =
                                    adminType ===
                                    "proprietor";


                                return (

                                    <div
                                        key={
                                            administrator.id
                                        }
                                        className="
                                            space-y-4
                                            p-4
                                        "
                                    >

                                        {/* NAME + STATUS */}

                                        <div
                                            className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    min-w-0
                                                    items-center
                                                    gap-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-primary/10
                                                    "
                                                >

                                                    <ShieldCheck
                                                        className="
                                                            h-5
                                                            w-5
                                                        "
                                                    />

                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            truncate
                                                            font-semibold
                                                        "
                                                    >
                                                        {
                                                            administrator.username
                                                        }
                                                    </p>


                                                    <p
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            text-muted-foreground
                                                        "
                                                    >
                                                        Administrator
                                                    </p>

                                                </div>

                                            </div>


                                            {administrator.is_active ? (

                                                <span
                                                    className="
                                                        shrink-0
                                                        rounded-full
                                                        bg-green-100
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-green-700
                                                    "
                                                >
                                                    Active
                                                </span>

                                            ) : (

                                                <span
                                                    className="
                                                        shrink-0
                                                        rounded-full
                                                        bg-red-100
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-red-700
                                                    "
                                                >
                                                    Inactive
                                                </span>

                                            )}

                                        </div>


                                        {/* DETAILS */}

                                        <div
                                            className="
                                                grid
                                                grid-cols-1
                                                gap-3
                                                rounded-lg
                                                bg-muted/30
                                                p-3
                                                sm:grid-cols-2
                                            "
                                        >

                                            <div>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    Type
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-medium
                                                    "
                                                >
                                                    {
                                                        formatAdminType(
                                                            administrator.admin_type
                                                        )
                                                    }
                                                </p>

                                            </div>


                                            <div>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    Username
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        break-all
                                                        text-sm
                                                        font-medium
                                                    "
                                                >
                                                    {
                                                        administrator.username
                                                    }
                                                </p>

                                            </div>


                                            <div
                                                className="
                                                    sm:col-span-2
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    Email
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        break-all
                                                        text-sm
                                                    "
                                                >
                                                    {
                                                        administrator.email ||
                                                        "—"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* ACTION */}

                                        <div>

                                            {isProprietor ? (

                                                <div
                                                    className="
                                                        rounded-lg
                                                        bg-muted
                                                        px-4
                                                        py-3
                                                        text-center
                                                        text-xs
                                                        font-medium
                                                        text-muted-foreground
                                                    "
                                                >
                                                    Protected
                                                </div>

                                            ) : administrator.is_active ? (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={
                                                        isProcessing &&
                                                        isDeactivating
                                                    }
                                                    onClick={() =>
                                                        handleDeactivate(
                                                            administrator
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                    "
                                                >

                                                    <ShieldOff
                                                        className="
                                                            mr-2
                                                            h-4
                                                            w-4
                                                        "
                                                    />

                                                    {
                                                        isProcessing &&
                                                        isDeactivating
                                                            ? "Deactivating..."
                                                            : "Deactivate"
                                                    }

                                                </Button>

                                            ) : (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={
                                                        isProcessing &&
                                                        isActivating
                                                    }
                                                    onClick={() =>
                                                        handleActivate(
                                                            administrator
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                    "
                                                >

                                                    <ShieldCheck
                                                        className="
                                                            mr-2
                                                            h-4
                                                            w-4
                                                        "
                                                    />

                                                    {
                                                        isProcessing &&
                                                        isActivating
                                                            ? "Activating..."
                                                            : "Activate"
                                                    }

                                                </Button>

                                            )}

                                        </div>

                                    </div>

                                );

                            }

                        )

                    )}

                </div>


                {/* =====================================
                    DESKTOP TABLE
                ===================================== */}

                <div
                    className="
                        hidden
                        overflow-x-auto
                        md:block
                    "
                >

                    <table
                        className="
                            w-full
                            min-w-[900px]
                            text-sm
                        "
                    >

                        <thead>

                            <tr
                                className="
                                    border-b
                                    bg-muted/40
                                    text-left
                                "
                            >

                                <th
                                    className="
                                        px-6
                                        py-4
                                        font-semibold
                                    "
                                >
                                    Administrator
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        font-semibold
                                    "
                                >
                                    Type
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        font-semibold
                                    "
                                >
                                    Username
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        font-semibold
                                    "
                                >
                                    Email
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        font-semibold
                                    "
                                >
                                    Status
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4
                                        text-right
                                        font-semibold
                                    "
                                >
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {administrators.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="
                                            px-6
                                            py-12
                                            text-center
                                            text-muted-foreground
                                        "
                                    >
                                        No administrators found.
                                    </td>

                                </tr>

                            ) : (

                                administrators.map(
                                    administrator => {

                                        const isProcessing =
                                            selectedAdminId ===
                                            administrator.id;


                                        const adminType =
                                            administrator
                                                .admin_type
                                                ?.toLowerCase();


                                        const isProprietor =
                                            adminType ===
                                            "proprietor";


                                        return (

                                            <tr
                                                key={
                                                    administrator.id
                                                }
                                                className="
                                                    border-b
                                                    last:border-0
                                                "
                                            >

                                                {/* ADMINISTRATOR */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                h-9
                                                                w-9
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-primary/10
                                                            "
                                                        >

                                                            <ShieldCheck
                                                                className="
                                                                    h-4
                                                                    w-4
                                                                "
                                                            />

                                                        </div>


                                                        <div>

                                                            <div
                                                                className="
                                                                    font-medium
                                                                "
                                                            >
                                                                {
                                                                    administrator.username
                                                                }
                                                            </div>


                                                            <div
                                                                className="
                                                                    text-xs
                                                                    text-muted-foreground
                                                                "
                                                            >
                                                                Admin
                                                            </div>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* TYPE */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            inline-flex
                                                            rounded-full
                                                            bg-blue-100
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            text-blue-700
                                                        "
                                                    >
                                                        {
                                                            formatAdminType(
                                                                administrator.admin_type
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* USERNAME */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >
                                                    {
                                                        administrator.username
                                                    }
                                                </td>


                                                {/* EMAIL */}

                                                <td
                                                    className="
                                                        max-w-[250px]
                                                        break-all
                                                        px-6
                                                        py-4
                                                        text-muted-foreground
                                                    "
                                                >

                                                    {
                                                        administrator.email ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    {administrator.is_active ? (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                rounded-full
                                                                bg-green-100
                                                                px-3
                                                                py-1
                                                                text-xs
                                                                font-semibold
                                                                text-green-700
                                                            "
                                                        >
                                                            Active
                                                        </span>

                                                    ) : (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                rounded-full
                                                                bg-red-100
                                                                px-3
                                                                py-1
                                                                text-xs
                                                                font-semibold
                                                                text-red-700
                                                            "
                                                        >
                                                            Inactive
                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                        text-right
                                                    "
                                                >

                                                    {isProprietor ? (

                                                        <span
                                                            className="
                                                                text-xs
                                                                text-muted-foreground
                                                            "
                                                        >
                                                            Protected
                                                        </span>

                                                    ) : administrator.is_active ? (

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={
                                                                isProcessing &&
                                                                isDeactivating
                                                            }
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    administrator
                                                                )
                                                            }
                                                        >

                                                            <ShieldOff
                                                                className="
                                                                    mr-2
                                                                    h-4
                                                                    w-4
                                                                "
                                                            />

                                                            {
                                                                isProcessing &&
                                                                isDeactivating
                                                                    ? "Deactivating..."
                                                                    : "Deactivate"
                                                            }

                                                        </Button>

                                                    ) : (

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={
                                                                isProcessing &&
                                                                isActivating
                                                            }
                                                            onClick={() =>
                                                                handleActivate(
                                                                    administrator
                                                                )
                                                            }
                                                        >

                                                            <ShieldCheck
                                                                className="
                                                                    mr-2
                                                                    h-4
                                                                    w-4
                                                                "
                                                            />

                                                            {
                                                                isProcessing &&
                                                                isActivating
                                                                    ? "Activating..."
                                                                    : "Activate"
                                                            }

                                                        </Button>

                                                    )}

                                                </td>

                                            </tr>

                                        );

                                    }

                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}


export default AdministratorsPage;

// import {
//     useState
// } from "react";

// import {
//     useAdministrators
// } from "@/hooks/useAdministrators";

// import {
//     useCreateAdministrator
// } from "@/hooks/useCreateAdministrator";

// import {
//     useActivateAdministrator
// } from "@/hooks/useActivateAdministrator";

// import {
//     useDeactivateAdministrator
// } from "@/hooks/useDeactivateAdministrator";

// import Loading
//     from "@/components/common/Loading";

// import {
//     Button
// } from "@/components/ui/button";

// import toast
//     from "react-hot-toast";

// import {
//     Plus,
//     ShieldCheck,
//     ShieldOff
// } from "lucide-react";


// function AdministratorsPage() {

//     /*
//     =========================================
//     GET ADMINISTRATORS
//     =========================================
//     */

//     const {
//         data: administrators = [],
//         isLoading
//     } = useAdministrators();


//     /*
//     =========================================
//     CREATE
//     =========================================
//     */

//     const {
//         mutate: createAdministrator,
//         isPending: isCreating
//     } =
//         useCreateAdministrator();


//     /*
//     =========================================
//     ACTIVATE
//     =========================================
//     */

//     const {
//         mutate: activateAdministrator,
//         isPending: isActivating
//     } =
//         useActivateAdministrator();


//     /*
//     =========================================
//     DEACTIVATE
//     =========================================
//     */

//     const {
//         mutate: deactivateAdministrator,
//         isPending: isDeactivating
//     } =
//         useDeactivateAdministrator();


//     /*
//     =========================================
//     FORM VISIBILITY
//     =========================================
//     */

//     const [
//         showCreateForm,
//         setShowCreateForm
//     ] = useState(false);


//     /*
//     =========================================
//     FORM STATE
//     =========================================
//     */

//     const [
//         formData,
//         setFormData
//     ] = useState({

//         username: "",

//         email: "",

//         password: "",

//         admin_type: "principal"

//     });


//     /*
//     =========================================
//     SELECTED ADMINISTRATOR
//     =========================================
//     */

//     const [
//         selectedAdminId,
//         setSelectedAdminId
//     ] = useState(null);


//     /*
//     =========================================
//     HANDLE INPUT
//     =========================================
//     */

//     const handleChange = (event) => {

//         const {
//             name,
//             value
//         } = event.target;


//         setFormData(
//             previous => ({

//                 ...previous,

//                 [name]: value

//             })
//         );

//     };


//     /*
//     =========================================
//     RESET FORM
//     =========================================
//     */

//     const resetForm = () => {

//         setFormData({

//             username: "",

//             email: "",

//             password: "",

//             admin_type: "principal"

//         });

//     };


//     /*
//     =========================================
//     CREATE ADMINISTRATOR
//     =========================================
//     */

//     const handleCreate = (event) => {

//         event.preventDefault();


//         if (
//             !formData.username.trim()
//         ) {

//             toast.error(
//                 "Username is required."
//             );

//             return;

//         }


//         if (
//             !formData.password
//         ) {

//             toast.error(
//                 "Password is required."
//             );

//             return;

//         }


//         createAdministrator(

//             {

//                 username:
//                     formData.username.trim(),

//                 email:
//                     formData.email.trim() ||
//                     null,

//                 password:
//                     formData.password,

//                 admin_type:
//                     formData.admin_type

//             },

//             {

//                 onSuccess: () => {

//                     toast.success(
//                         "Administrator account created successfully."
//                     );


//                     resetForm();

//                     setShowCreateForm(
//                         false
//                     );

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error.response?.data?.message ||
//                         "Failed to create administrator."

//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     ACTIVATE
//     =========================================
//     */

//     const handleActivate = (
//         administrator
//     ) => {

//         setSelectedAdminId(
//             administrator.id
//         );


//         activateAdministrator(

//             administrator.id,

//             {

//                 onSuccess: () => {

//                     toast.success(

//                         `${administrator.username} has been activated.`

//                     );

//                     setSelectedAdminId(
//                         null
//                     );

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error.response?.data?.message ||
//                         "Failed to activate administrator."

//                     );

//                     setSelectedAdminId(
//                         null
//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     DEACTIVATE
//     =========================================
//     */

//     const handleDeactivate = (
//         administrator
//     ) => {

//         const confirmed =
//             window.confirm(

//                 `Are you sure you want to deactivate ${administrator.username}?`

//             );


//         if (!confirmed) {

//             return;

//         }


//         setSelectedAdminId(
//             administrator.id
//         );


//         deactivateAdministrator(

//             administrator.id,

//             {

//                 onSuccess: () => {

//                     toast.success(

//                         `${administrator.username} has been deactivated.`

//                     );

//                     setSelectedAdminId(
//                         null
//                     );

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error.response?.data?.message ||
//                         "Failed to deactivate administrator."

//                     );

//                     setSelectedAdminId(
//                         null
//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     FORMAT ADMIN TYPE
//     =========================================
//     */

//     const formatAdminType = (
//         adminType
//     ) => {

//         if (!adminType) {

//             return "—";

//         }


//         return adminType
//             .split("_")
//             .map(
//                 word =>
//                     word
//                         .charAt(0)
//                         .toUpperCase() +
//                     word.slice(1)
//             )
//             .join(" ");

//     };


//     /*
//     =========================================
//     LOADING
//     =========================================
//     */

//     if (isLoading) {

//         return (

//             <Loading
//                 message="Loading administrators..."
//             />

//         );

//     }


//     return (

//         <div className="space-y-6">


//             {/* =====================================
//                 PAGE HEADER
//             ===================================== */}

//             <div
//                 className="
//                     flex
//                     flex-col
//                     gap-4
//                     sm:flex-row
//                     sm:items-center
//                     sm:justify-between
//                 "
//             >

//                 <div>

//                     <h1
//                         className="
//                             text-2xl
//                             font-bold
//                         "
//                     >
//                         Administrators
//                     </h1>


//                     <p
//                         className="
//                             mt-1
//                             text-sm
//                             text-muted-foreground
//                         "
//                     >
//                         Manage school administrator accounts.
//                     </p>

//                 </div>


//                 <Button
//                     type="button"
//                     onClick={() =>
//                         setShowCreateForm(
//                             previous => !previous
//                         )
//                     }
//                 >

//                     <Plus
//                         className="
//                             mr-2
//                             h-4
//                             w-4
//                         "
//                     />

//                     Add Administrator

//                 </Button>

//             </div>


//             {/* =====================================
//                 CREATE FORM
//             ===================================== */}

//             {showCreateForm && (

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <div
//                         className="
//                             mb-6
//                         "
//                     >

//                         <h2
//                             className="
//                                 text-lg
//                                 font-semibold
//                             "
//                         >
//                             Create Administrator
//                         </h2>


//                         <p
//                             className="
//                                 mt-1
//                                 text-sm
//                                 text-muted-foreground
//                             "
//                         >
//                             Create a new administrator account for the school.
//                         </p>

//                     </div>


//                     <form
//                         onSubmit={
//                             handleCreate
//                         }
//                         className="
//                             grid
//                             gap-5
//                             md:grid-cols-2
//                         "
//                     >


//                         {/* USERNAME */}

//                         <div>

//                             <label
//                                 htmlFor="username"
//                                 className="
//                                     mb-2
//                                     block
//                                     text-sm
//                                     font-medium
//                                 "
//                             >
//                                 Username
//                             </label>


//                             <input
//                                 id="username"
//                                 name="username"
//                                 type="text"
//                                 value={
//                                     formData.username
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 placeholder="Enter username"
//                                 className="
//                                     w-full
//                                     rounded-md
//                                     border
//                                     bg-background
//                                     px-3
//                                     py-2
//                                     text-sm
//                                     outline-none
//                                     focus:ring-2
//                                     focus:ring-primary
//                                 "
//                             />

//                         </div>


//                         {/* EMAIL */}

//                         <div>

//                             <label
//                                 htmlFor="email"
//                                 className="
//                                     mb-2
//                                     block
//                                     text-sm
//                                     font-medium
//                                 "
//                             >
//                                 Email
//                             </label>


//                             <input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 value={
//                                     formData.email
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 placeholder="administrator@school.com"
//                                 className="
//                                     w-full
//                                     rounded-md
//                                     border
//                                     bg-background
//                                     px-3
//                                     py-2
//                                     text-sm
//                                     outline-none
//                                     focus:ring-2
//                                     focus:ring-primary
//                                 "
//                             />

//                         </div>


//                         {/* ADMIN TYPE */}

//                         <div>

//                             <label
//                                 htmlFor="admin_type"
//                                 className="
//                                     mb-2
//                                     block
//                                     text-sm
//                                     font-medium
//                                 "
//                             >
//                                 Administrator Type
//                             </label>


//                             <select
//                                 id="admin_type"
//                                 name="admin_type"
//                                 value={
//                                     formData.admin_type
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 className="
//                                     w-full
//                                     rounded-md
//                                     border
//                                     bg-background
//                                     px-3
//                                     py-2
//                                     text-sm
//                                     outline-none
//                                     focus:ring-2
//                                     focus:ring-primary
//                                 "
//                             >

//                                 <option value="principal">
//                                     Principal
//                                 </option>

//                                 <option value="vice_principal">
//                                     Vice Principal
//                                 </option>

//                                 <option value="bursar">
//                                     Bursar
//                                 </option>

//                                 <option value="librarian">
//                                     Librarian
//                                 </option>

//                             </select>

//                         </div>


//                         {/* PASSWORD */}

//                         <div>

//                             <label
//                                 htmlFor="password"
//                                 className="
//                                     mb-2
//                                     block
//                                     text-sm
//                                     font-medium
//                                 "
//                             >
//                                 Temporary Password
//                             </label>


//                             <input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 value={
//                                     formData.password
//                                 }
//                                 onChange={
//                                     handleChange
//                                 }
//                                 placeholder="Enter temporary password"
//                                 className="
//                                     w-full
//                                     rounded-md
//                                     border
//                                     bg-background
//                                     px-3
//                                     py-2
//                                     text-sm
//                                     outline-none
//                                     focus:ring-2
//                                     focus:ring-primary
//                                 "
//                             />

//                         </div>


//                         {/* FORM ACTIONS */}

//                         <div
//                             className="
//                                 flex
//                                 gap-3
//                                 md:col-span-2
//                             "
//                         >

//                             <Button
//                                 type="submit"
//                                 disabled={
//                                     isCreating
//                                 }
//                             >

//                                 {isCreating
//                                     ? "Creating..."
//                                     : "Create Administrator"
//                                 }

//                             </Button>


//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 disabled={
//                                     isCreating
//                                 }
//                                 onClick={() => {

//                                     resetForm();

//                                     setShowCreateForm(
//                                         false
//                                     );

//                                 }}
//                             >
//                                 Cancel
//                             </Button>

//                         </div>

//                     </form>

//                 </div>

//             )}


//             {/* =====================================
//                 ADMINISTRATORS CARD
//             ===================================== */}

//             <div
//                 className="
//                     overflow-hidden
//                     rounded-xl
//                     border
//                     bg-background
//                     shadow-sm
//                 "
//             >

//                 <div
//                     className="
//                         border-b
//                         px-6
//                         py-4
//                     "
//                 >

//                     <div
//                         className="
//                             flex
//                             items-center
//                             justify-between
//                         "
//                     >

//                         <div>

//                             <h2
//                                 className="
//                                     font-semibold
//                                 "
//                             >
//                                 Administrators
//                             </h2>


//                             <p
//                                 className="
//                                     mt-1
//                                     text-xs
//                                     text-muted-foreground
//                                 "
//                             >
//                                 Proprietor and other school administrators
//                             </p>

//                         </div>


//                         <div
//                             className="
//                                 rounded-full
//                                 bg-muted
//                                 px-3
//                                 py-1
//                                 text-xs
//                                 font-medium
//                             "
//                         >
//                             {
//                                 administrators.length
//                             }
//                         </div>

//                     </div>

//                 </div>


//                 {/* =====================================
//                     TABLE
//                 ===================================== */}

//                 <div
//                     className="
//                         overflow-x-auto
//                     "
//                 >

//                     <table
//                         className="
//                             w-full
//                             text-sm
//                         "
//                     >

//                         <thead>

//                             <tr
//                                 className="
//                                     border-b
//                                     bg-muted/40
//                                     text-left
//                                 "
//                             >

//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         font-semibold
//                                     "
//                                 >
//                                     Administrator
//                                 </th>


//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         font-semibold
//                                     "
//                                 >
//                                     Type
//                                 </th>


//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         font-semibold
//                                     "
//                                 >
//                                     Username
//                                 </th>


//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         font-semibold
//                                     "
//                                 >
//                                     Email
//                                 </th>


//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         font-semibold
//                                     "
//                                 >
//                                     Status
//                                 </th>


//                                 <th
//                                     className="
//                                         px-6
//                                         py-4
//                                         text-right
//                                         font-semibold
//                                     "
//                                 >
//                                     Action
//                                 </th>

//                             </tr>

//                         </thead>


//                         <tbody>

//                             {administrators.length === 0 ? (

//                                 <tr>

//                                     <td
//                                         colSpan="6"
//                                         className="
//                                             px-6
//                                             py-12
//                                             text-center
//                                             text-muted-foreground
//                                         "
//                                     >
//                                         No administrators found.
//                                     </td>

//                                 </tr>

//                             ) : (

//                                 administrators.map(
//                                     administrator => {

//                                         const isProcessing =
//                                             selectedAdminId ===
//                                             administrator.id;


//                                         const adminType =
//                                             administrator
//                                                 .admin_type
//                                                 ?.toLowerCase();


//                                         const isProprietor =
//                                             adminType ===
//                                             "proprietor";


//                                         return (

//                                             <tr
//                                                 key={
//                                                     administrator.id
//                                                 }
//                                                 className="
//                                                     border-b
//                                                     last:border-0
//                                                 "
//                                             >

//                                                 {/* ADMINISTRATOR */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                     "
//                                                 >

//                                                     <div
//                                                         className="
//                                                             flex
//                                                             items-center
//                                                             gap-3
//                                                         "
//                                                     >

//                                                         <div
//                                                             className="
//                                                                 flex
//                                                                 h-9
//                                                                 w-9
//                                                                 items-center
//                                                                 justify-center
//                                                                 rounded-full
//                                                                 bg-primary/10
//                                                             "
//                                                         >

//                                                             <ShieldCheck
//                                                                 className="
//                                                                     h-4
//                                                                     w-4
//                                                                 "
//                                                             />

//                                                         </div>


//                                                         <div>

//                                                             <div
//                                                                 className="
//                                                                     font-medium
//                                                                 "
//                                                             >
//                                                                 {
//                                                                     administrator.username
//                                                                 }
//                                                             </div>


//                                                             <div
//                                                                 className="
//                                                                     text-xs
//                                                                     text-muted-foreground
//                                                                 "
//                                                             >
//                                                                 Admin
//                                                             </div>

//                                                         </div>

//                                                     </div>

//                                                 </td>


//                                                 {/* TYPE */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                     "
//                                                 >

//                                                     <span
//                                                         className="
//                                                             inline-flex
//                                                             rounded-full
//                                                             bg-blue-100
//                                                             px-3
//                                                             py-1
//                                                             text-xs
//                                                             font-semibold
//                                                             text-blue-700
//                                                         "
//                                                     >
//                                                         {
//                                                             formatAdminType(
//                                                                 administrator.admin_type
//                                                             )
//                                                         }
//                                                     </span>

//                                                 </td>


//                                                 {/* USERNAME */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                     "
//                                                 >
//                                                     {
//                                                         administrator.username
//                                                     }
//                                                 </td>


//                                                 {/* EMAIL */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                         text-muted-foreground
//                                                     "
//                                                 >

//                                                     {
//                                                         administrator.email ||
//                                                         "—"
//                                                     }

//                                                 </td>


//                                                 {/* STATUS */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                     "
//                                                 >

//                                                     {administrator.is_active ? (

//                                                         <span
//                                                             className="
//                                                                 inline-flex
//                                                                 rounded-full
//                                                                 bg-green-100
//                                                                 px-3
//                                                                 py-1
//                                                                 text-xs
//                                                                 font-semibold
//                                                                 text-green-700
//                                                             "
//                                                         >
//                                                             Active
//                                                         </span>

//                                                     ) : (

//                                                         <span
//                                                             className="
//                                                                 inline-flex
//                                                                 rounded-full
//                                                                 bg-red-100
//                                                                 px-3
//                                                                 py-1
//                                                                 text-xs
//                                                                 font-semibold
//                                                                 text-red-700
//                                                             "
//                                                         >
//                                                             Inactive
//                                                         </span>

//                                                     )}

//                                                 </td>


//                                                 {/* ACTION */}

//                                                 <td
//                                                     className="
//                                                         px-6
//                                                         py-4
//                                                         text-right
//                                                     "
//                                                 >

//                                                     {isProprietor ? (

//                                                         <span
//                                                             className="
//                                                                 text-xs
//                                                                 text-muted-foreground
//                                                             "
//                                                         >
//                                                             Protected
//                                                         </span>

//                                                     ) : administrator.is_active ? (

//                                                         <Button
//                                                             type="button"
//                                                             variant="outline"
//                                                             disabled={
//                                                                 isProcessing &&
//                                                                 isDeactivating
//                                                             }
//                                                             onClick={() =>
//                                                                 handleDeactivate(
//                                                                     administrator
//                                                                 )
//                                                             }
//                                                         >

//                                                             <ShieldOff
//                                                                 className="
//                                                                     mr-2
//                                                                     h-4
//                                                                     w-4
//                                                                 "
//                                                             />

//                                                             {
//                                                                 isProcessing &&
//                                                                 isDeactivating
//                                                                     ? "Deactivating..."
//                                                                     : "Deactivate"
//                                                             }

//                                                         </Button>

//                                                     ) : (

//                                                         <Button
//                                                             type="button"
//                                                             variant="outline"
//                                                             disabled={
//                                                                 isProcessing &&
//                                                                 isActivating
//                                                             }
//                                                             onClick={() =>
//                                                                 handleActivate(
//                                                                     administrator
//                                                                 )
//                                                             }
//                                                         >

//                                                             <ShieldCheck
//                                                                 className="
//                                                                     mr-2
//                                                                     h-4
//                                                                     w-4
//                                                                 "
//                                                             />

//                                                             {
//                                                                 isProcessing &&
//                                                                 isActivating
//                                                                     ? "Activating..."
//                                                                     : "Activate"
//                                                             }

//                                                         </Button>

//                                                     )}

//                                                 </td>

//                                             </tr>

//                                         );

//                                     }

//                                 )

//                             )}

//                         </tbody>

//                     </table>

//                 </div>

//             </div>

//         </div>

//     );

// }


// export default AdministratorsPage;