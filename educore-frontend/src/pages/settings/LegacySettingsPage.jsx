import {
    useEffect,
    useState
} from "react";

import {
    useSchoolSettings
} from "@/hooks/useSchoolSettings";

import {
    useUpdateSchoolSettings
} from "@/hooks/useUpdateSchoolSettings";

import {
    useSetCurrentSession
} from "@/hooks/useSetCurrentSession";

import {
    useSessions
} from "@/hooks/useSessions";

import {
    useCreateSession
} from "@/hooks/useCreateSession";

import {
    useUpdateSession
} from "@/hooks/useUpdateSession";

import {
    useTerms
} from "@/hooks/useTerms";

import Loading from "@/components/common/Loading";

import {
    Button
} from "@/components/ui/Button";

import toast from "react-hot-toast";


function SettingsPage() {

    /*
    =========================================
    SESSION MUTATIONS
    =========================================
    */

    const {
        mutate: createSession,
        isPending: isCreating
    } = useCreateSession();


    const {
        mutate: updateSession,
        isPending: isUpdating
    } = useUpdateSession();


    const {
        mutate: setCurrentSession,
        isPending: isSettingCurrent
    } = useSetCurrentSession();


    /*
    =========================================
    SCHOOL SETTINGS
    =========================================
    */

    const {
        data: settings,
        isLoading
    } = useSchoolSettings();


    const {
        mutate: updateSettings,
        isPending: isSavingSettings
    } = useUpdateSchoolSettings();


    /*
    =========================================
    SESSIONS
    =========================================
    */

    const {
        data: sessions = []
    } = useSessions();


    /*
    =========================================
    TERMS
    =========================================
    */

    const {
        data: terms = []
    } = useTerms();


    /*
    =========================================
    SESSION FORM
    =========================================
    */

    const [
        sessionForm,
        setSessionForm
    ] = useState({

        session_name: "",

        start_date: "",

        end_date: ""

    });


    const [
        editingSessionId,
        setEditingSessionId
    ] = useState(null);


    /*
    =========================================
    MAIN SETTINGS FORM
    =========================================
    */

    const [
        formData,
        setFormData
    ] = useState({

        /*
        SCHOOL INFORMATION
        */

        school_name: "",

        school_email: "",

        school_phone: "",

        school_address: "",

        school_logo: "",


        /*
        WEBSITE BRANDING
        */

        school_motto:
            "Excellence • Character • Knowledge",

        school_level:
            "Primary & Secondary School",


        /*
        COLORS
        */

        primary_color: "#1D4ED8",

        secondary_color: "#FFFFFF",


        /*
        ACADEMIC SETTINGS
        */

        current_session_id: "",

        current_term_id: "",

        ca_max_score: "40",

        exam_max_score: "60",

        passing_score: "50",


        /*
        PREFIX SETTINGS
        */

        admission_prefix: "",

        student_prefix: "",

        teacher_prefix: "",

        parent_prefix: ""

    });


    /*
    =========================================
    LOAD SETTINGS
    =========================================
    */

    useEffect(() => {

        if (!settings) {
            return;
        }


        setFormData({

            /*
            SCHOOL INFORMATION
            */

            school_name:
                settings.school_name || "",

            school_email:
                settings.school_email || "",

            school_phone:
                settings.school_phone || "",

            school_address:
                settings.school_address || "",

            school_logo:
                settings.school_logo || "",


            /*
            WEBSITE BRANDING
            */

            school_motto:
                settings.school_motto ||
                "Excellence • Character • Knowledge",

            school_level:
                settings.school_level ||
                "Primary & Secondary School",


            /*
            COLORS
            */

            primary_color:
                settings.primary_color ||
                "#1D4ED8",

            secondary_color:
                settings.secondary_color ||
                "#FFFFFF",


            /*
            ACADEMIC SETTINGS
            */

            current_session_id:
                settings.current_session_id != null
                    ? String(settings.current_session_id)
                    : "",

            current_term_id:
                settings.current_term_id != null
                    ? String(settings.current_term_id)
                    : "",

            ca_max_score:
                settings.ca_max_score != null
                    ? String(settings.ca_max_score)
                    : "40",

            exam_max_score:
                settings.exam_max_score != null
                    ? String(settings.exam_max_score)
                    : "60",

            passing_score:
                settings.passing_score != null
                    ? String(settings.passing_score)
                    : "50",


            /*
            PREFIX SETTINGS
            */

            admission_prefix:
                settings.admission_prefix || "",

            student_prefix:
                settings.student_prefix || "",

            teacher_prefix:
                settings.teacher_prefix || "",

            parent_prefix:
                settings.parent_prefix || ""

        });

    }, [settings]);


    /*
    =========================================
    MAIN SETTINGS INPUT
    =========================================
    */

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


    /*
    =========================================
    SESSION INPUT
    =========================================
    */

    const handleSessionChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setSessionForm(previous => ({

            ...previous,

            [name]: value

        }));

    };


    /*
    =========================================
    EDIT SESSION
    =========================================
    */

    const handleEditSession = (session) => {

        setEditingSessionId(session.id);


        setSessionForm({

            session_name:
                session.session_name || "",

            start_date:
                session.start_date
                    ? String(session.start_date).slice(0, 10)
                    : "",

            end_date:
                session.end_date
                    ? String(session.end_date).slice(0, 10)
                    : ""

        });


        /*
        Scroll the session form into view
        */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    /*
    =========================================
    CANCEL SESSION EDIT
    =========================================
    */

    const handleCancelSessionEdit = () => {

        setEditingSessionId(null);


        setSessionForm({

            session_name: "",

            start_date: "",

            end_date: ""

        });

    };


    /*
    =========================================
    CREATE / UPDATE SESSION
    =========================================
    */

    const handleSessionSubmit = (event) => {

        event.preventDefault();


        const sessionName =
            sessionForm.session_name.trim();


        if (
            !sessionName ||
            !sessionForm.start_date ||
            !sessionForm.end_date
        ) {

            toast.error(
                "Please complete all session fields."
            );

            return;

        }


        if (
            sessionForm.end_date <=
            sessionForm.start_date
        ) {

            toast.error(
                "End date must be after start date."
            );

            return;

        }


        const data = {

            session_name: sessionName,

            start_date:
                sessionForm.start_date,

            end_date:
                sessionForm.end_date

        };


        /*
        =====================================
        UPDATE EXISTING SESSION
        =====================================
        */

        if (editingSessionId !== null) {

            updateSession(

                {

                    id: editingSessionId,

                    data

                },

                {

                    onSuccess: () => {

                        toast.success(
                            "Academic session updated successfully."
                        );


                        handleCancelSessionEdit();

                    },


                    onError: (error) => {

                        toast.error(

                            error?.response?.data?.message ||
                            "Failed to update academic session."

                        );

                    }

                }

            );

            return;

        }


        /*
        =====================================
        CREATE NEW SESSION
        =====================================
        */

        createSession(

            data,

            {

                onSuccess: () => {

                    toast.success(
                        "Academic session created successfully."
                    );


                    setSessionForm({

                        session_name: "",

                        start_date: "",

                        end_date: ""

                    });

                },


                onError: (error) => {

                    toast.error(

                        error?.response?.data?.message ||
                        "Failed to create academic session."

                    );

                }

            }

        );

    };


    /*
    =========================================
    SET SESSION AS CURRENT
    =========================================
    */

    const handleSetCurrentSession = (session) => {

        if (session.is_current) {
            return;
        }


        setCurrentSession(

            session.id,

            {

                onSuccess: () => {

                    /*
                    Immediately update local settings
                    */

                    setFormData(previous => ({

                        ...previous,

                        current_session_id:
                            String(session.id),

                        current_term_id: ""

                    }));


                    toast.success(

                        `${session.session_name} is now the current academic session.`

                    );

                },


                onError: (error) => {

                    toast.error(

                        error?.response?.data?.message ||
                        "Failed to set current academic session."

                    );

                }

            }

        );

    };


    /*
    =========================================
    CURRENT SESSION CHANGE
    =========================================
    */

    const handleCurrentSessionChange = (event) => {

        const selectedSessionId =
            event.target.value;


        setFormData(previous => ({

            ...previous,

            current_session_id:
                selectedSessionId,

            current_term_id: ""

        }));

    };


    /*
    =========================================
    CURRENT TERM CHANGE
    =========================================
    */

    const handleCurrentTermChange = (event) => {

        const selectedTermId =
            event.target.value;


        setFormData(previous => ({

            ...previous,

            current_term_id:
                selectedTermId

        }));

    };


    /*
    =========================================
    FILTER TERMS
    =========================================
    */

    const filteredTerms =
        terms.filter(term =>

            String(term.session_id) ===
            String(formData.current_session_id)

        );


    /*
    =========================================
    SAVE SCHOOL SETTINGS
    =========================================
    */

    const handleSubmit = (event) => {

        event.preventDefault();


        const payload = {

            ...formData,

            current_session_id:
                formData.current_session_id
                    ? Number(formData.current_session_id)
                    : null,

            current_term_id:
                formData.current_term_id
                    ? Number(formData.current_term_id)
                    : null,

            ca_max_score:
                Number(formData.ca_max_score),

            exam_max_score:
                Number(formData.exam_max_score),

            passing_score:
                Number(formData.passing_score)

        };


        updateSettings(

            payload,

            {

                onSuccess: () => {

                    toast.success(
                        "School settings updated successfully."
                    );

                },


                onError: (error) => {

                    toast.error(

                        error?.response?.data?.message ||
                        "Failed to update school settings."

                    );

                }

            }

        );

    };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (isLoading) {

        return (

            <Loading
                message="Loading school settings..."
            />

        );

    }


    /*
    =========================================
    RENDER
    =========================================
    */

    return (

        <div
            className="
                w-full
                min-w-0
                space-y-5
                overflow-x-hidden
                sm:space-y-6
            "
        >


            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div
                className="
                    min-w-0
                "
            >

                <h1
                    className="
                        text-xl
                        font-bold
                        tracking-tight
                        sm:text-2xl
                    "
                >
                    School Settings
                </h1>


                <p
                    className="
                        mt-1
                        text-sm
                        text-muted-foreground
                    "
                >
                    Configure EDUCORE for your school.
                </p>

            </div>


            {/* =====================================
                MAIN SETTINGS FORM
            ===================================== */}

            <form
                onSubmit={handleSubmit}
                className="
                    min-w-0
                    space-y-5
                    sm:space-y-6
                "
            >


                {/* =====================================
                    SCHOOL INFORMATION
                ===================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        School Information
                    </h2>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            sm:mt-5
                            md:grid-cols-2
                        "
                    >

                        {/* SCHOOL NAME */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Name
                            </label>

                            <input
                                name="school_name"
                                value={formData.school_name}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* SCHOOL EMAIL */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Email
                            </label>

                            <input
                                type="email"
                                name="school_email"
                                value={formData.school_email}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* SCHOOL PHONE */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Phone
                            </label>

                            <input
                                name="school_phone"
                                value={formData.school_phone}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* SCHOOL LOGO */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Logo URL
                            </label>

                            <input
                                name="school_logo"
                                value={formData.school_logo}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* SCHOOL ADDRESS */}

                        <div
                            className="
                                min-w-0
                                md:col-span-2
                            "
                        >

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Address
                            </label>

                            <textarea
                                name="school_address"
                                value={formData.school_address}
                                onChange={handleChange}
                                rows="3"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    resize-y
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>

                    </div>

                </div>


                {/* =====================================
                    WEBSITE BRANDING
                ===================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Website Branding
                    </h2>


                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                            sm:text-sm
                        "
                    >
                        Control the branding information
                        displayed on the public school website.
                    </p>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            sm:mt-5
                            md:grid-cols-2
                        "
                    >

                        {/* MOTTO */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Motto / Tagline
                            </label>

                            <input
                                name="school_motto"
                                value={formData.school_motto}
                                onChange={handleChange}
                                placeholder="Excellence • Character • Knowledge"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-muted-foreground
                                "
                            >
                                Appears below the school name
                                in the website header.
                            </p>

                        </div>


                        {/* SCHOOL LEVEL */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                School Level
                            </label>

                            <input
                                name="school_level"
                                value={formData.school_level}
                                onChange={handleChange}
                                placeholder="Primary & Secondary School"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-muted-foreground
                                "
                            >
                                Examples: Primary School,
                                Secondary School,
                                Primary & Secondary School.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        HEADER PREVIEW
                    ================================= */}

                    <div
                        className="
                            mt-5
                            w-full
                            min-w-0
                            overflow-hidden
                            rounded-xl
                            border
                            bg-slate-50
                            p-4
                            sm:mt-6
                            sm:p-5
                        "
                    >

                        <p
                            className="
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-wider
                                text-muted-foreground
                                sm:text-xs
                            "
                        >
                            Website Header Preview
                        </p>


                        <div
                            className="
                                mt-4
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >

                            {/* LOGO */}

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-full
                                    bg-blue-600
                                    text-base
                                    font-bold
                                    text-white
                                    sm:h-12
                                    sm:w-12
                                    sm:text-lg
                                "
                            >

                                {formData.school_logo ? (

                                    <img
                                        src={formData.school_logo}
                                        alt="School logo"
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                        "
                                    />

                                ) : (

                                    formData.school_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "E"

                                )}

                            </div>


                            {/* SCHOOL BRANDING TEXT */}

                            <div
                                className="
                                    min-w-0
                                    flex-1
                                "
                            >

                                <p
                                    className="
                                        break-words
                                        text-sm
                                        font-bold
                                        text-slate-900
                                        sm:text-base
                                    "
                                >
                                    {
                                        formData.school_name ||
                                        "School Name"
                                    }
                                </p>


                                <p
                                    className="
                                        break-words
                                        text-[10px]
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                        sm:text-xs
                                    "
                                >
                                    {
                                        formData.school_motto ||
                                        "School Motto"
                                    }
                                </p>


                                <p
                                    className="
                                        mt-0.5
                                        break-words
                                        text-[10px]
                                        text-slate-400
                                        sm:text-xs
                                    "
                                >
                                    {
                                        formData.school_level ||
                                        "School Level"
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    BRANDING COLOURS
                ===================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Branding Colours
                    </h2>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-5
                            sm:mt-5
                            md:grid-cols-2
                        "
                    >

                        {/* PRIMARY */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Primary Colour
                            </label>


                            <div
                                className="
                                    mt-1
                                    flex
                                    min-w-0
                                    items-center
                                    gap-2
                                    sm:gap-3
                                "
                            >

                                <input
                                    type="color"
                                    name="primary_color"
                                    value={formData.primary_color}
                                    onChange={handleChange}
                                    className="
                                        h-10
                                        w-12
                                        shrink-0
                                        cursor-pointer
                                        rounded
                                        border
                                        p-0.5
                                        sm:w-16
                                    "
                                />


                                <input
                                    name="primary_color"
                                    value={formData.primary_color}
                                    onChange={handleChange}
                                    className="
                                        min-w-0
                                        flex-1
                                        rounded-md
                                        border
                                        bg-background
                                        px-3
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:ring-2
                                        focus:ring-primary/20
                                    "
                                />

                            </div>

                        </div>


                        {/* SECONDARY */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Secondary Colour
                            </label>


                            <div
                                className="
                                    mt-1
                                    flex
                                    min-w-0
                                    items-center
                                    gap-2
                                    sm:gap-3
                                "
                            >

                                <input
                                    type="color"
                                    name="secondary_color"
                                    value={formData.secondary_color}
                                    onChange={handleChange}
                                    className="
                                        h-10
                                        w-12
                                        shrink-0
                                        cursor-pointer
                                        rounded
                                        border
                                        p-0.5
                                        sm:w-16
                                    "
                                />


                                <input
                                    name="secondary_color"
                                    value={formData.secondary_color}
                                    onChange={handleChange}
                                    className="
                                        min-w-0
                                        flex-1
                                        rounded-md
                                        border
                                        bg-background
                                        px-3
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:ring-2
                                        focus:ring-primary/20
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    ACADEMIC SETTINGS
                ===================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Academic Settings
                    </h2>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            sm:mt-5
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >

                        {/* CURRENT SESSION */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Current Academic Session
                            </label>

                            <select
                                name="current_session_id"
                                value={
                                    formData.current_session_id
                                }
                                onChange={
                                    handleCurrentSessionChange
                                }
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            >

                                <option value="">
                                    Select Session
                                </option>


                                {sessions.map(session => (

                                    <option
                                        key={session.id}
                                        value={session.id}
                                    >

                                        {session.session_name}

                                        {session.is_current
                                            ? " (Current)"
                                            : ""}

                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* CURRENT TERM */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Current Term
                            </label>

                            <select
                                name="current_term_id"
                                value={
                                    formData.current_term_id
                                }
                                onChange={
                                    handleCurrentTermChange
                                }
                                disabled={
                                    !formData.current_session_id
                                }
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            >

                                <option value="">
                                    Select Term
                                </option>


                                {filteredTerms.map(term => (

                                    <option
                                        key={term.id}
                                        value={term.id}
                                    >
                                        {term.term_name}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* CA */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                CA Maximum Score
                            </label>

                            <input
                                type="number"
                                name="ca_max_score"
                                value={formData.ca_max_score}
                                onChange={handleChange}
                                min="0"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* EXAM */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Exam Maximum Score
                            </label>

                            <input
                                type="number"
                                name="exam_max_score"
                                value={formData.exam_max_score}
                                onChange={handleChange}
                                min="0"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* PASSING */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Passing Score
                            </label>

                            <input
                                type="number"
                                name="passing_score"
                                value={formData.passing_score}
                                onChange={handleChange}
                                min="0"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>

                    </div>

                </div>


                {/* =====================================
                    PREFIX SETTINGS
                ===================================== */}

                <div
                    className="
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-background
                        p-4
                        shadow-sm
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Identification Prefixes
                    </h2>


                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                            sm:text-sm
                        "
                    >
                        Configure the prefixes used when
                        generating school identification numbers.
                    </p>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            sm:mt-5
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {/* ADMISSION */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Admission Prefix
                            </label>

                            <input
                                name="admission_prefix"
                                value={formData.admission_prefix}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* STUDENT */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Student Prefix
                            </label>

                            <input
                                name="student_prefix"
                                value={formData.student_prefix}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* TEACHER */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Teacher Prefix
                            </label>

                            <input
                                name="teacher_prefix"
                                value={formData.teacher_prefix}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* PARENT */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Parent Prefix
                            </label>

                            <input
                                name="parent_prefix"
                                value={formData.parent_prefix}
                                onChange={handleChange}
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>

                    </div>

                </div>


                {/* =====================================
                    SAVE SETTINGS
                ===================================== */}

                <div
                    className="
                        flex
                        w-full
                        justify-stretch
                        sm:justify-end
                    "
                >

                    <Button
                        type="submit"
                        disabled={isSavingSettings}
                        className="
                            w-full
                            sm:w-auto
                        "
                    >

                        {isSavingSettings
                            ? "Saving..."
                            : "Save Settings"}

                    </Button>

                </div>

            </form>


            {/* =================================================
                ACADEMIC SESSION MANAGEMENT
                ================================================= */}

            <section
                className="
                    w-full
                    min-w-0
                    overflow-hidden
                    rounded-xl
                    border
                    bg-background
                    p-4
                    shadow-sm
                    sm:p-6
                "
            >

                {/* =====================================
                    SECTION HEADER
                ===================================== */}

                <div className="min-w-0">

                    <h2
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Academic Sessions
                    </h2>


                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                            sm:text-sm
                        "
                    >
                        Create, edit, and activate academic
                        sessions for this school.
                    </p>

                </div>


                {/* =====================================
                    SESSION FORM
                ===================================== */}

                <form
                    onSubmit={handleSessionSubmit}
                    className="
                        mt-5
                        w-full
                        min-w-0
                        overflow-hidden
                        rounded-xl
                        border
                        bg-slate-50
                        p-4
                        sm:mt-6
                        sm:p-5
                    "
                >

                    <h3
                        className="
                            text-sm
                            font-semibold
                            text-gray-800
                            sm:text-base
                        "
                    >

                        {editingSessionId !== null
                            ? "Edit Academic Session"
                            : "Add Academic Session"}

                    </h3>


                    <div
                        className="
                            mt-4
                            grid
                            min-w-0
                            grid-cols-1
                            gap-4
                            md:grid-cols-3
                        "
                    >

                        {/* SESSION NAME */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Session Name
                            </label>

                            <input
                                type="text"
                                name="session_name"
                                value={
                                    sessionForm.session_name
                                }
                                onChange={
                                    handleSessionChange
                                }
                                placeholder="2027/2028"
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* START DATE */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="start_date"
                                value={
                                    sessionForm.start_date
                                }
                                onChange={
                                    handleSessionChange
                                }
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>


                        {/* END DATE */}

                        <div className="min-w-0">

                            <label
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                End Date
                            </label>

                            <input
                                type="date"
                                name="end_date"
                                value={
                                    sessionForm.end_date
                                }
                                onChange={
                                    handleSessionChange
                                }
                                className="
                                    mt-1
                                    block
                                    w-full
                                    min-w-0
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2.5
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-primary/20
                                "
                            />

                        </div>

                    </div>


                    {/* =================================
                        SESSION BUTTONS
                    ================================= */}

                    <div
                        className="
                            mt-5
                            flex
                            flex-col-reverse
                            gap-2
                            sm:flex-row
                            sm:justify-end
                            sm:gap-3
                        "
                    >

                        {editingSessionId !== null && (

                            <Button
                                type="button"
                                variant="outline"
                                onClick={
                                    handleCancelSessionEdit
                                }
                                className="
                                    w-full
                                    sm:w-auto
                                "
                            >
                                Cancel
                            </Button>

                        )}


                        <Button
                            type="submit"
                            disabled={
                                isCreating ||
                                isUpdating
                            }
                            className="
                                w-full
                                sm:w-auto
                            "
                        >

                            {isCreating || isUpdating

                                ? "Saving..."

                                : editingSessionId !== null

                                    ? "Update Session"

                                    : "Add Session"}

                        </Button>

                    </div>

                </form>


                {/* =====================================
                    SESSION LIST
                ===================================== */}

                <div
                    className="
                        mt-5
                        space-y-3
                        sm:mt-6
                    "
                >

                    {sessions.length === 0 ? (

                        <div
                            className="
                                rounded-xl
                                border
                                p-5
                                text-center
                                text-sm
                                text-muted-foreground
                                sm:p-6
                            "
                        >
                            No academic sessions found.
                        </div>

                    ) : (

                        sessions.map(session => (

                            <div
                                key={session.id}
                                className="
                                    w-full
                                    min-w-0
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    p-4
                                    sm:p-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        min-w-0
                                        flex-col
                                        gap-4
                                        md:flex-row
                                        md:items-center
                                        md:justify-between
                                    "
                                >

                                    {/* SESSION INFORMATION */}

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                flex-wrap
                                                items-center
                                                gap-2
                                                sm:gap-3
                                            "
                                        >

                                            <h3
                                                className="
                                                    min-w-0
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                    text-gray-800
                                                    sm:text-base
                                                "
                                            >
                                                {session.session_name}
                                            </h3>


                                            {session.is_current && (

                                                <span
                                                    className="
                                                        shrink-0
                                                        rounded-full
                                                        bg-green-100
                                                        px-2.5
                                                        py-1
                                                        text-[10px]
                                                        font-semibold
                                                        text-green-700
                                                        sm:px-3
                                                        sm:text-xs
                                                    "
                                                >
                                                    Current
                                                </span>

                                            )}

                                        </div>


                                        <p
                                            className="
                                                mt-2
                                                break-words
                                                text-xs
                                                text-muted-foreground
                                                sm:text-sm
                                            "
                                        >

                                            {String(
                                                session.start_date
                                            ).slice(0, 10)}

                                            {" → "}

                                            {String(
                                                session.end_date
                                            ).slice(0, 10)}

                                        </p>

                                    </div>


                                    {/* SESSION ACTIONS */}

                                    <div
                                        className="
                                            flex
                                            w-full
                                            flex-col
                                            gap-2
                                            sm:flex-row
                                            sm:flex-wrap
                                            md:w-auto
                                        "
                                    >

                                        {/* EDIT */}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleEditSession(
                                                    session
                                                )
                                            }
                                            className="
                                                w-full
                                                sm:w-auto
                                            "
                                        >
                                            Edit
                                        </Button>


                                        {/* SET CURRENT */}

                                        {!session.is_current && (

                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    isSettingCurrent
                                                }
                                                onClick={() =>
                                                    handleSetCurrentSession(
                                                        session
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    sm:w-auto
                                                "
                                            >

                                                {isSettingCurrent
                                                    ? "Updating..."
                                                    : "Set as Current"}

                                            </Button>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </section>

        </div>

    );

}


export default SettingsPage;

// import {
//     useEffect,
//     useState
// } from "react";

// import {
//     useSchoolSettings
// } from "@/hooks/useSchoolSettings";

// import {
//     useUpdateSchoolSettings
// } from "@/hooks/useUpdateSchoolSettings";

// import {
//     useSetCurrentSession
// } from "@/hooks/useSetCurrentSession";

// import {
//     useSessions
// } from "@/hooks/useSessions";

// import {
//     useCreateSession
// } from "@/hooks/useCreateSession";

// import {
//     useUpdateSession
// } from "@/hooks/useUpdateSession";

// import {
//     useTerms
// } from "@/hooks/useTerms";

// import Loading from "@/components/common/Loading";

// import {
//     Button
// } from "@/components/ui/Button";

// import toast from "react-hot-toast";


// function SettingsPage() {

//     /*
//     =========================================
//     SESSION MUTATIONS
//     =========================================
//     */

//     const {
//         mutate: createSession,
//         isPending: isCreating
//     } = useCreateSession();


//     const {
//         mutate: updateSession,
//         isPending: isUpdating
//     } = useUpdateSession();


//     const {
//         mutate: setCurrentSession,
//         isPending: isSettingCurrent
//     } = useSetCurrentSession();


//     /*
//     =========================================
//     SCHOOL SETTINGS
//     =========================================
//     */

//     const {
//         data: settings,
//         isLoading
//     } = useSchoolSettings();


//     const {
//         mutate: updateSettings,
//         isPending: isSavingSettings
//     } = useUpdateSchoolSettings();


//     /*
//     =========================================
//     SESSIONS
//     =========================================
//     */

//     const {
//         data: sessions = []
//     } = useSessions();


//     /*
//     =========================================
//     TERMS
//     =========================================
//     */

//     const {
//         data: terms = []
//     } = useTerms();


//     /*
//     =========================================
//     SESSION FORM
//     =========================================
//     */

//     const [
//         sessionForm,
//         setSessionForm
//     ] = useState({

//         session_name: "",

//         start_date: "",

//         end_date: ""

//     });


//     const [
//         editingSessionId,
//         setEditingSessionId
//     ] = useState(null);


//     /*
//     =========================================
//     MAIN SETTINGS FORM
//     =========================================
//     */

//     const [
//         formData,
//         setFormData
//     ] = useState({

//         /*
//         SCHOOL INFORMATION
//         */

//         school_name: "",

//         school_email: "",

//         school_phone: "",

//         school_address: "",

//         school_logo: "",


//         /*
//         WEBSITE BRANDING
//         */

//         school_motto:
//             "Excellence • Character • Knowledge",

//         school_level:
//             "Primary & Secondary School",


//         /*
//         COLORS
//         */

//         primary_color: "#1D4ED8",

//         secondary_color: "#FFFFFF",


//         /*
//         ACADEMIC SETTINGS
//         */

//         current_session_id: "",

//         current_term_id: "",

//         ca_max_score: "40",

//         exam_max_score: "60",

//         passing_score: "50",


//         /*
//         PREFIX SETTINGS
//         */

//         admission_prefix: "",

//         student_prefix: "",

//         teacher_prefix: "",

//         parent_prefix: ""

//     });


//     /*
//     =========================================
//     LOAD SETTINGS
//     =========================================
//     */

//     useEffect(() => {

//         if (!settings) {
//             return;
//         }


//         setFormData({

//             /*
//             SCHOOL INFORMATION
//             */

//             school_name:
//                 settings.school_name || "",

//             school_email:
//                 settings.school_email || "",

//             school_phone:
//                 settings.school_phone || "",

//             school_address:
//                 settings.school_address || "",

//             school_logo:
//                 settings.school_logo || "",


//             /*
//             WEBSITE BRANDING
//             */

//             school_motto:
//                 settings.school_motto ||
//                 "Excellence • Character • Knowledge",

//             school_level:
//                 settings.school_level ||
//                 "Primary & Secondary School",


//             /*
//             COLORS
//             */

//             primary_color:
//                 settings.primary_color ||
//                 "#1D4ED8",

//             secondary_color:
//                 settings.secondary_color ||
//                 "#FFFFFF",


//             /*
//             ACADEMIC SETTINGS
//             */

//             current_session_id:
//                 settings.current_session_id != null
//                     ? String(settings.current_session_id)
//                     : "",

//             current_term_id:
//                 settings.current_term_id != null
//                     ? String(settings.current_term_id)
//                     : "",

//             ca_max_score:
//                 settings.ca_max_score != null
//                     ? String(settings.ca_max_score)
//                     : "40",

//             exam_max_score:
//                 settings.exam_max_score != null
//                     ? String(settings.exam_max_score)
//                     : "60",

//             passing_score:
//                 settings.passing_score != null
//                     ? String(settings.passing_score)
//                     : "50",


//             /*
//             PREFIX SETTINGS
//             */

//             admission_prefix:
//                 settings.admission_prefix || "",

//             student_prefix:
//                 settings.student_prefix || "",

//             teacher_prefix:
//                 settings.teacher_prefix || "",

//             parent_prefix:
//                 settings.parent_prefix || ""

//         });

//     }, [settings]);


//     /*
//     =========================================
//     MAIN SETTINGS INPUT
//     =========================================
//     */

//     const handleChange = (event) => {

//         const {
//             name,
//             value
//         } = event.target;


//         setFormData(previous => ({

//             ...previous,

//             [name]: value

//         }));

//     };


//     /*
//     =========================================
//     SESSION INPUT
//     =========================================
//     */

//     const handleSessionChange = (event) => {

//         const {
//             name,
//             value
//         } = event.target;


//         setSessionForm(previous => ({

//             ...previous,

//             [name]: value

//         }));

//     };


//     /*
//     =========================================
//     EDIT SESSION
//     =========================================
//     */

//     const handleEditSession = (session) => {

//         setEditingSessionId(session.id);


//         setSessionForm({

//             session_name:
//                 session.session_name || "",

//             start_date:
//                 session.start_date
//                     ? String(session.start_date).slice(0, 10)
//                     : "",

//             end_date:
//                 session.end_date
//                     ? String(session.end_date).slice(0, 10)
//                     : ""

//         });

//         /*
//         Scroll the session form into view
//         */

//         window.scrollTo({

//             top: 0,

//             behavior: "smooth"

//         });

//     };


//     /*
//     =========================================
//     CANCEL SESSION EDIT
//     =========================================
//     */

//     const handleCancelSessionEdit = () => {

//         setEditingSessionId(null);


//         setSessionForm({

//             session_name: "",

//             start_date: "",

//             end_date: ""

//         });

//     };


//     /*
//     =========================================
//     CREATE / UPDATE SESSION
//     =========================================
//     */

//     const handleSessionSubmit = (event) => {

//         event.preventDefault();


//         const sessionName =
//             sessionForm.session_name.trim();


//         if (
//             !sessionName ||
//             !sessionForm.start_date ||
//             !sessionForm.end_date
//         ) {

//             toast.error(
//                 "Please complete all session fields."
//             );

//             return;

//         }


//         if (
//             sessionForm.end_date <=
//             sessionForm.start_date
//         ) {

//             toast.error(
//                 "End date must be after start date."
//             );

//             return;

//         }


//         const data = {

//             session_name: sessionName,

//             start_date:
//                 sessionForm.start_date,

//             end_date:
//                 sessionForm.end_date

//         };


//         /*
//         =====================================
//         UPDATE EXISTING SESSION
//         =====================================
//         */

//         if (editingSessionId !== null) {

//             updateSession(

//                 {

//                     id: editingSessionId,

//                     data

//                 },

//                 {

//                     onSuccess: () => {

//                         toast.success(
//                             "Academic session updated successfully."
//                         );


//                         handleCancelSessionEdit();

//                     },


//                     onError: (error) => {

//                         toast.error(

//                             error?.response?.data?.message ||
//                             "Failed to update academic session."

//                         );

//                     }

//                 }

//             );

//             return;

//         }


//         /*
//         =====================================
//         CREATE NEW SESSION
//         =====================================
//         */

//         createSession(

//             data,

//             {

//                 onSuccess: () => {

//                     toast.success(
//                         "Academic session created successfully."
//                     );


//                     setSessionForm({

//                         session_name: "",

//                         start_date: "",

//                         end_date: ""

//                     });

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error?.response?.data?.message ||
//                         "Failed to create academic session."

//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     SET SESSION AS CURRENT
//     =========================================
//     */

//     const handleSetCurrentSession = (session) => {

//         if (session.is_current) {
//             return;
//         }


//         setCurrentSession(

//             session.id,

//             {

//                 onSuccess: () => {

//                     /*
//                     Immediately update the local
//                     settings form so the selected
//                     session changes visually.
//                     */

//                     setFormData(previous => ({

//                         ...previous,

//                         current_session_id:
//                             String(session.id),

//                         current_term_id: ""

//                     }));


//                     toast.success(

//                         `${session.session_name} is now the current academic session.`

//                     );

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error?.response?.data?.message ||
//                         "Failed to set current academic session."

//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     CURRENT SESSION CHANGE
//     =========================================
//     */

//     const handleCurrentSessionChange = (event) => {

//         const selectedSessionId =
//             event.target.value;


//         setFormData(previous => ({

//             ...previous,

//             current_session_id:
//                 selectedSessionId,

//             current_term_id: ""

//         }));

//     };


//     /*
//     =========================================
//     CURRENT TERM CHANGE
//     =========================================
//     */

//     const handleCurrentTermChange = (event) => {

//         const selectedTermId =
//             event.target.value;


//         setFormData(previous => ({

//             ...previous,

//             current_term_id:
//                 selectedTermId

//         }));

//     };


//     /*
//     =========================================
//     FILTER TERMS
//     =========================================
//     */

//     const filteredTerms =
//         terms.filter(term =>

//             String(term.session_id) ===
//             String(formData.current_session_id)

//         );


//     /*
//     =========================================
//     SAVE SCHOOL SETTINGS
//     =========================================
//     */

//     const handleSubmit = (event) => {

//         event.preventDefault();


//         const payload = {

//             ...formData,

//             current_session_id:
//                 formData.current_session_id
//                     ? Number(formData.current_session_id)
//                     : null,

//             current_term_id:
//                 formData.current_term_id
//                     ? Number(formData.current_term_id)
//                     : null,

//             ca_max_score:
//                 Number(formData.ca_max_score),

//             exam_max_score:
//                 Number(formData.exam_max_score),

//             passing_score:
//                 Number(formData.passing_score)

//         };


//         updateSettings(

//             payload,

//             {

//                 onSuccess: () => {

//                     toast.success(
//                         "School settings updated successfully."
//                     );

//                 },


//                 onError: (error) => {

//                     toast.error(

//                         error?.response?.data?.message ||
//                         "Failed to update school settings."

//                     );

//                 }

//             }

//         );

//     };


//     /*
//     =========================================
//     LOADING
//     =========================================
//     */

//     if (isLoading) {

//         return (

//             <Loading
//                 message="Loading school settings..."
//             />

//         );

//     }


//     /*
//     =========================================
//     RENDER
//     =========================================
//     */

//     return (

//         <div className="space-y-6">


//             {/* PAGE HEADER */}

//             <div>

//                 <h1
//                     className="
//                         text-2xl
//                         font-bold
//                     "
//                 >
//                     School Settings
//                 </h1>


//                 <p
//                     className="
//                         mt-1
//                         text-sm
//                         text-muted-foreground
//                     "
//                 >
//                     Configure EDUCORE for your school.
//                 </p>

//             </div>


//             {/* =====================================
//                 MAIN SETTINGS FORM
//             ===================================== */}

//             <form
//                 onSubmit={handleSubmit}
//                 className="space-y-6"
//             >


//                 {/* =====================================
//                     SCHOOL INFORMATION
//                 ===================================== */}

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <h2 className="text-lg font-semibold">
//                         School Information
//                     </h2>


//                     <div
//                         className="
//                             mt-5
//                             grid
//                             gap-4
//                             md:grid-cols-2
//                         "
//                     >

//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Name
//                             </label>

//                             <input
//                                 name="school_name"
//                                 value={formData.school_name}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Email
//                             </label>

//                             <input
//                                 type="email"
//                                 name="school_email"
//                                 value={formData.school_email}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Phone
//                             </label>

//                             <input
//                                 name="school_phone"
//                                 value={formData.school_phone}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Logo URL
//                             </label>

//                             <input
//                                 name="school_logo"
//                                 value={formData.school_logo}
//                                 onChange={handleChange}
//                                 placeholder="https://example.com/logo.png"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div className="md:col-span-2">

//                             <label className="text-sm font-medium">
//                                 School Address
//                             </label>

//                             <textarea
//                                 name="school_address"
//                                 value={formData.school_address}
//                                 onChange={handleChange}
//                                 rows="3"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>

//                     </div>

//                 </div>


//                 {/* =====================================
//                     WEBSITE BRANDING
//                 ===================================== */}

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <h2 className="text-lg font-semibold">
//                         Website Branding
//                     </h2>


//                     <p
//                         className="
//                             mt-1
//                             text-sm
//                             text-muted-foreground
//                         "
//                     >
//                         Control the branding information
//                         displayed on the public school website.
//                     </p>


//                     <div
//                         className="
//                             mt-5
//                             grid
//                             gap-4
//                             md:grid-cols-2
//                         "
//                     >

//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Motto / Tagline
//                             </label>

//                             <input
//                                 name="school_motto"
//                                 value={formData.school_motto}
//                                 onChange={handleChange}
//                                 placeholder="Excellence • Character • Knowledge"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                             <p
//                                 className="
//                                     mt-1
//                                     text-xs
//                                     text-muted-foreground
//                                 "
//                             >
//                                 Appears below the school name
//                                 in the website header.
//                             </p>

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 School Level
//                             </label>

//                             <input
//                                 name="school_level"
//                                 value={formData.school_level}
//                                 onChange={handleChange}
//                                 placeholder="Primary & Secondary School"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                             <p
//                                 className="
//                                     mt-1
//                                     text-xs
//                                     text-muted-foreground
//                                 "
//                             >
//                                 Examples: Primary School,
//                                 Secondary School,
//                                 Primary & Secondary School.
//                             </p>

//                         </div>

//                     </div>


//                     {/* PREVIEW */}

//                     <div
//                         className="
//                             mt-6
//                             rounded-xl
//                             border
//                             bg-slate-50
//                             p-5
//                         "
//                     >

//                         <p
//                             className="
//                                 text-xs
//                                 font-semibold
//                                 uppercase
//                                 tracking-wider
//                                 text-muted-foreground
//                             "
//                         >
//                             Website Header Preview
//                         </p>


//                         <div
//                             className="
//                                 mt-4
//                                 flex
//                                 items-center
//                                 gap-3
//                             "
//                         >

//                             <div
//                                 className="
//                                     flex
//                                     h-12
//                                     w-12
//                                     items-center
//                                     justify-center
//                                     overflow-hidden
//                                     rounded-full
//                                     bg-blue-600
//                                     text-lg
//                                     font-bold
//                                     text-white
//                                 "
//                             >

//                                 {formData.school_logo ? (

//                                     <img
//                                         src={formData.school_logo}
//                                         alt="School logo"
//                                         className="
//                                             h-full
//                                             w-full
//                                             object-cover
//                                         "
//                                     />

//                                 ) : (

//                                     formData.school_name
//                                         ?.charAt(0)
//                                         ?.toUpperCase() || "E"

//                                 )}

//                             </div>


//                             <div>

//                                 <p className="font-bold text-slate-900">

//                                     {
//                                         formData.school_name ||
//                                         "School Name"
//                                     }

//                                 </p>


//                                 <p
//                                     className="
//                                         text-xs
//                                         uppercase
//                                         tracking-wide
//                                         text-slate-500
//                                     "
//                                 >

//                                     {
//                                         formData.school_motto ||
//                                         "School Motto"
//                                     }

//                                 </p>


//                                 <p
//                                     className="
//                                         mt-0.5
//                                         text-xs
//                                         text-slate-400
//                                     "
//                                 >

//                                     {
//                                         formData.school_level ||
//                                         "School Level"
//                                     }

//                                 </p>

//                             </div>

//                         </div>

//                     </div>

//                 </div>


//                 {/* =====================================
//                     BRANDING COLOURS
//                 ===================================== */}

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <h2 className="text-lg font-semibold">
//                         Branding Colours
//                     </h2>


//                     <div
//                         className="
//                             mt-5
//                             grid
//                             gap-4
//                             md:grid-cols-2
//                         "
//                     >

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Primary Colour
//                             </label>

//                             <div
//                                 className="
//                                     mt-1
//                                     flex
//                                     items-center
//                                     gap-3
//                                 "
//                             >

//                                 <input
//                                     type="color"
//                                     name="primary_color"
//                                     value={formData.primary_color}
//                                     onChange={handleChange}
//                                     className="
//                                         h-10
//                                         w-16
//                                         cursor-pointer
//                                     "
//                                 />

//                                 <input
//                                     name="primary_color"
//                                     value={formData.primary_color}
//                                     onChange={handleChange}
//                                     className="
//                                         flex-1
//                                         rounded-md
//                                         border
//                                         px-3
//                                         py-2
//                                     "
//                                 />

//                             </div>

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 Secondary Colour
//                             </label>

//                             <div
//                                 className="
//                                     mt-1
//                                     flex
//                                     items-center
//                                     gap-3
//                                 "
//                             >

//                                 <input
//                                     type="color"
//                                     name="secondary_color"
//                                     value={formData.secondary_color}
//                                     onChange={handleChange}
//                                     className="
//                                         h-10
//                                         w-16
//                                         cursor-pointer
//                                     "
//                                 />

//                                 <input
//                                     name="secondary_color"
//                                     value={formData.secondary_color}
//                                     onChange={handleChange}
//                                     className="
//                                         flex-1
//                                         rounded-md
//                                         border
//                                         px-3
//                                         py-2
//                                     "
//                                 />

//                             </div>

//                         </div>

//                     </div>

//                 </div>


//                 {/* =====================================
//                     ACADEMIC SETTINGS
//                 ===================================== */}

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <h2 className="text-lg font-semibold">
//                         Academic Settings
//                     </h2>


//                     <div
//                         className="
//                             mt-5
//                             grid
//                             gap-4
//                             md:grid-cols-2
//                             lg:grid-cols-3
//                         "
//                     >

//                         {/* CURRENT SESSION */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Current Academic Session
//                             </label>

//                             <select
//                                 name="current_session_id"
//                                 value={
//                                     formData.current_session_id
//                                 }
//                                 onChange={
//                                     handleCurrentSessionChange
//                                 }
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             >

//                                 <option value="">
//                                     Select Session
//                                 </option>


//                                 {sessions.map(session => (

//                                     <option
//                                         key={session.id}
//                                         value={session.id}
//                                     >

//                                         {session.session_name}

//                                         {session.is_current
//                                             ? " (Current)"
//                                             : ""}

//                                     </option>

//                                 ))}

//                             </select>

//                         </div>


//                         {/* CURRENT TERM */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Current Term
//                             </label>

//                             <select
//                                 name="current_term_id"
//                                 value={
//                                     formData.current_term_id
//                                 }
//                                 onChange={
//                                     handleCurrentTermChange
//                                 }
//                                 disabled={
//                                     !formData.current_session_id
//                                 }
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                     disabled:opacity-50
//                                 "
//                             >

//                                 <option value="">
//                                     Select Term
//                                 </option>


//                                 {filteredTerms.map(term => (

//                                     <option
//                                         key={term.id}
//                                         value={term.id}
//                                     >
//                                         {term.term_name}
//                                     </option>

//                                 ))}

//                             </select>

//                         </div>


//                         {/* CA */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 CA Maximum Score
//                             </label>

//                             <input
//                                 type="number"
//                                 name="ca_max_score"
//                                 value={formData.ca_max_score}
//                                 onChange={handleChange}
//                                 min="0"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         {/* EXAM */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Exam Maximum Score
//                             </label>

//                             <input
//                                 type="number"
//                                 name="exam_max_score"
//                                 value={formData.exam_max_score}
//                                 onChange={handleChange}
//                                 min="0"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         {/* PASSING */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Passing Score
//                             </label>

//                             <input
//                                 type="number"
//                                 name="passing_score"
//                                 value={formData.passing_score}
//                                 onChange={handleChange}
//                                 min="0"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>

//                     </div>

//                 </div>


//                 {/* =====================================
//                     PREFIX SETTINGS
//                 ===================================== */}

//                 <div
//                     className="
//                         rounded-xl
//                         border
//                         bg-background
//                         p-6
//                         shadow-sm
//                     "
//                 >

//                     <h2 className="text-lg font-semibold">
//                         Identification Prefixes
//                     </h2>


//                     <div
//                         className="
//                             mt-5
//                             grid
//                             gap-4
//                             md:grid-cols-2
//                             lg:grid-cols-4
//                         "
//                     >

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Admission Prefix
//                             </label>

//                             <input
//                                 name="admission_prefix"
//                                 value={formData.admission_prefix}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 Student Prefix
//                             </label>

//                             <input
//                                 name="student_prefix"
//                                 value={formData.student_prefix}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 Teacher Prefix
//                             </label>

//                             <input
//                                 name="teacher_prefix"
//                                 value={formData.teacher_prefix}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         <div>

//                             <label className="text-sm font-medium">
//                                 Parent Prefix
//                             </label>

//                             <input
//                                 name="parent_prefix"
//                                 value={formData.parent_prefix}
//                                 onChange={handleChange}
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>

//                     </div>

//                 </div>


//                 {/* SAVE SETTINGS */}

//                 <div className="flex justify-end">

//                     <Button
//                         type="submit"
//                         disabled={isSavingSettings}
//                     >

//                         {isSavingSettings
//                             ? "Saving..."
//                             : "Save Settings"}

//                     </Button>

//                 </div>

//             </form>


//             {/* =================================================
//                 ACADEMIC SESSION MANAGEMENT

//                 IMPORTANT:
//                 THIS IS OUTSIDE THE MAIN SETTINGS FORM.
//                 ================================================= */}

//             <section
//                 className="
//                     rounded-xl
//                     border
//                     bg-background
//                     p-6
//                     shadow-sm
//                 "
//             >

//                 <div>

//                     <h2
//                         className="
//                             text-lg
//                             font-semibold
//                         "
//                     >
//                         Academic Sessions
//                     </h2>


//                     <p
//                         className="
//                             mt-1
//                             text-sm
//                             text-muted-foreground
//                         "
//                     >
//                         Create, edit, and activate academic
//                         sessions for this school.
//                     </p>

//                 </div>


//                 {/* =====================================
//                     SESSION FORM
//                 ===================================== */}

//                 <form
//                     onSubmit={handleSessionSubmit}
//                     className="
//                         mt-6
//                         rounded-xl
//                         border
//                         bg-slate-50
//                         p-5
//                     "
//                 >

//                     <h3 className="font-semibold text-gray-800">

//                         {editingSessionId !== null
//                             ? "Edit Academic Session"
//                             : "Add Academic Session"}

//                     </h3>


//                     <div
//                         className="
//                             mt-4
//                             grid
//                             gap-4
//                             md:grid-cols-3
//                         "
//                     >

//                         {/* SESSION NAME */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Session Name
//                             </label>

//                             <input
//                                 type="text"
//                                 name="session_name"
//                                 value={
//                                     sessionForm.session_name
//                                 }
//                                 onChange={
//                                     handleSessionChange
//                                 }
//                                 placeholder="2027/2028"
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         {/* START DATE */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 Start Date
//                             </label>

//                             <input
//                                 type="date"
//                                 name="start_date"
//                                 value={
//                                     sessionForm.start_date
//                                 }
//                                 onChange={
//                                     handleSessionChange
//                                 }
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>


//                         {/* END DATE */}

//                         <div>

//                             <label className="text-sm font-medium">
//                                 End Date
//                             </label>

//                             <input
//                                 type="date"
//                                 name="end_date"
//                                 value={
//                                     sessionForm.end_date
//                                 }
//                                 onChange={
//                                     handleSessionChange
//                                 }
//                                 className="
//                                     mt-1
//                                     w-full
//                                     rounded-md
//                                     border
//                                     px-3
//                                     py-2
//                                 "
//                             />

//                         </div>

//                     </div>


//                     {/* SESSION FORM BUTTONS */}

//                     <div
//                         className="
//                             mt-5
//                             flex
//                             justify-end
//                             gap-3
//                         "
//                     >

//                         {editingSessionId !== null && (

//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={
//                                     handleCancelSessionEdit
//                                 }
//                             >
//                                 Cancel
//                             </Button>

//                         )}


//                         <Button
//                             type="submit"
//                             disabled={
//                                 isCreating ||
//                                 isUpdating
//                             }
//                         >

//                             {isCreating || isUpdating

//                                 ? "Saving..."

//                                 : editingSessionId !== null

//                                     ? "Update Session"

//                                     : "Add Session"}

//                         </Button>

//                     </div>

//                 </form>


//                 {/* =====================================
//                     SESSION LIST
//                 ===================================== */}

//                 <div
//                     className="
//                         mt-6
//                         space-y-3
//                     "
//                 >

//                     {sessions.length === 0 ? (

//                         <div
//                             className="
//                                 rounded-xl
//                                 border
//                                 p-6
//                                 text-center
//                                 text-sm
//                                 text-muted-foreground
//                             "
//                         >
//                             No academic sessions found.
//                         </div>

//                     ) : (

//                         sessions.map(session => (

//                             <div
//                                 key={session.id}
//                                 className="
//                                     rounded-xl
//                                     border
//                                     p-5
//                                 "
//                             >

//                                 <div
//                                     className="
//                                         flex
//                                         flex-col
//                                         gap-4
//                                         md:flex-row
//                                         md:items-center
//                                         md:justify-between
//                                     "
//                                 >

//                                     <div>

//                                         <div
//                                             className="
//                                                 flex
//                                                 flex-wrap
//                                                 items-center
//                                                 gap-3
//                                             "
//                                         >

//                                             <h3
//                                                 className="
//                                                     font-semibold
//                                                     text-gray-800
//                                                 "
//                                             >
//                                                 {session.session_name}
//                                             </h3>


//                                             {session.is_current && (

//                                                 <span
//                                                     className="
//                                                         rounded-full
//                                                         bg-green-100
//                                                         px-3
//                                                         py-1
//                                                         text-xs
//                                                         font-semibold
//                                                         text-green-700
//                                                     "
//                                                 >
//                                                     Current
//                                                 </span>

//                                             )}

//                                         </div>


//                                         <p
//                                             className="
//                                                 mt-2
//                                                 text-sm
//                                                 text-muted-foreground
//                                             "
//                                         >

//                                             {String(
//                                                 session.start_date
//                                             ).slice(0, 10)}

//                                             {" → "}

//                                             {String(
//                                                 session.end_date
//                                             ).slice(0, 10)}

//                                         </p>

//                                     </div>


//                                     <div
//                                         className="
//                                             flex
//                                             flex-wrap
//                                             gap-2
//                                         "
//                                     >

//                                         {/* EDIT */}

//                                         <Button
//                                             type="button"
//                                             variant="outline"
//                                             onClick={() =>
//                                                 handleEditSession(
//                                                     session
//                                                 )
//                                             }
//                                         >
//                                             Edit
//                                         </Button>


//                                         {/* SET CURRENT */}

//                                         {!session.is_current && (

//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 disabled={
//                                                     isSettingCurrent
//                                                 }
//                                                 onClick={() =>
//                                                     handleSetCurrentSession(
//                                                         session
//                                                     )
//                                                 }
//                                             >

//                                                 {isSettingCurrent
//                                                     ? "Updating..."
//                                                     : "Set as Current"}

//                                             </Button>

//                                         )}

//                                     </div>

//                                 </div>

//                             </div>

//                         ))

//                     )}

//                 </div>

//             </section>

//         </div>

//     );

// }


// export default SettingsPage;