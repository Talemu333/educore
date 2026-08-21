import {
    useMemo,
    useState
} from "react";

import {
    ArrowRight,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Filter,
    GraduationCap,
    RefreshCw,
    RotateCcw,
    Search,
    UserCheck,
    Users,
    Loader2,
    X
} from "lucide-react";

import {
    usePromotionHistory
} from "@/hooks/usePromotionHistory";


function StudentPromotionHistoryPage() {

    const [page, setPage] =
        useState(1);

    const [limit] =
        useState(10);

    const [searchInput, setSearchInput] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [action, setAction] =
        useState("");


    /*
    =========================================
    API
    =========================================
    */

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch
    } = usePromotionHistory({

        page,

        limit,

        search,

        action

    });


    /*
    =========================================
    DATA
    =========================================
    */

    const history =
        data?.history || [];


    const pagination =
        data?.pagination || {

            page: 1,

            limit,

            total: 0,

            totalPages: 1

        };


    /*
    =========================================
    STATISTICS
    =========================================

    These statistics represent the records
    currently loaded on the page.
    =========================================
    */

    const statistics =
        useMemo(() => {

            return {

                promoted:
                    history.filter(
                        item =>
                            item.action === "Promoted"
                    ).length,

                repeated:
                    history.filter(
                        item =>
                            item.action === "Repeated"
                    ).length,

                graduated:
                    history.filter(
                        item =>
                            item.action === "Graduated"
                    ).length

            };

        }, [history]);


    /*
    =========================================
    SEARCH
    =========================================
    */

    const handleSearch = () => {

        setPage(1);

        setSearch(
            searchInput.trim()
        );

    };


    const handleSearchKeyDown = event => {

        if (
            event.key === "Enter"
        ) {

            handleSearch();

        }

    };


    /*
    =========================================
    ACTION FILTER
    =========================================
    */

    const handleActionChange = event => {

        setPage(1);

        setAction(
            event.target.value
        );

    };


    /*
    =========================================
    CLEAR FILTERS
    =========================================
    */

    const clearFilters = () => {

        setSearchInput("");

        setSearch("");

        setAction("");

        setPage(1);

    };


    /*
    =========================================
    ACTION BADGE
    =========================================
    */

    const getActionBadge = currentAction => {

        if (
            currentAction === "Promoted"
        ) {

            return (

                <span
                    className="promotion-status promoted"
                >

                    <ArrowUp
                        size={14}
                    />

                    Promoted

                </span>

            );

        }


        if (
            currentAction === "Repeated"
        ) {

            return (

                <span
                    className="promotion-status repeated"
                >

                    <RotateCcw
                        size={14}
                    />

                    Repeated

                </span>

            );

        }


        if (
            currentAction === "Graduated"
        ) {

            return (

                <span
                    className="promotion-status graduated"
                >

                    <GraduationCap
                        size={14}
                    />

                    Graduated

                </span>

            );

        }


        return (

            <span
                className="promotion-status default"
            >
                {currentAction || "Unknown"}
            </span>

        );

    };


    /*
    =========================================
    FORMAT DATE
    =========================================
    */

    const formatDate = value => {

        if (!value) {

            return "—";

        }

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /*
    =========================================
    FORMAT TIME
    =========================================
    */

    const formatTime = value => {

        if (!value) {

            return "";

        }

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date.toLocaleTimeString(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /*
    =========================================
    FORMAT CLASS / ARM
    =========================================
    */

    const formatPlacement = (
        className,
        armName
    ) => {

        if (!className) {

            return "—";

        }

        if (!armName) {

            return className;

        }

        return `${className} - ${armName}`;

    };


    /*
    =========================================
    STUDENT NAME
    =========================================
    */

    const getStudentName = item => {

        return [

            item.surname,

            item.first_name,

            item.middle_name

        ]

            .filter(Boolean)

            .join(" ");

    };


    /*
    =========================================
    INITIALS
    =========================================
    */

    const getInitials = item => {

        const first =
            item.first_name?.[0] ||
            "";

        const surname =
            item.surname?.[0] ||
            "";

        return (
            `${first}${surname}` ||
            "S"
        ).toUpperCase();

    };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (isLoading) {

        return (

            <div className="promotion-page">

                <style>
                    {pageStyles}
                </style>

                <div className="promotion-loading">

                    <div className="loading-icon">

                        <Loader2
                            size={30}
                            className="loading-spinner"
                        />

                    </div>

                    <h5>
                        Loading promotion history
                    </h5>

                    <p>
                        Retrieving student progression records...
                    </p>

                </div>

            </div>

        );

    }


    /*
    =========================================
    ERROR
    =========================================
    */

    if (isError) {

        return (

            <div className="promotion-page">

                <style>
                    {pageStyles}
                </style>

                <div className="promotion-error">

                    <div className="error-icon">

                        <FileText
                            size={28}
                        />

                    </div>

                    <div>

                        <h5>
                            Unable to load promotion history
                        </h5>

                        <p>
                            Something went wrong while
                            retrieving the records.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                                refetch()
                            }
                        >

                            <RefreshCw
                                size={16}
                                className="me-2"
                            />

                            Try Again

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="promotion-page">

            <style>
                {pageStyles}
            </style>


            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div className="promotion-header">

                <div>

                    <div className="header-icon">

                        <Clock
                            size={22}
                        />

                    </div>

                    <div>

                        <h1>
                            Promotion History
                        </h1>

                        <p>
                            View and audit student promotion,
                            repetition and graduation records.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="btn btn-light refresh-button"
                    onClick={() =>
                        refetch()
                    }
                    disabled={
                        isFetching
                    }
                >

                    <RefreshCw
                        size={16}
                        className={
                            isFetching
                                ? "me-2 loading-spinner"
                                : "me-2"
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =====================================
                STATISTICS
            ===================================== */}

            <div className="statistics-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div className="stat-content">

                        <span className="stat-label">
                            TOTAL RECORDS
                        </span>

                        <strong className="stat-number">
                            {
                                pagination.total
                            }
                        </strong>

                        <span className="stat-description">
                            All promotion records
                        </span>

                    </div>

                    <div className="stat-icon total">

                        <Users
                            size={22}
                        />

                    </div>

                </div>


                {/* PROMOTED */}

                <div className="stat-card">

                    <div className="stat-content">

                        <span className="stat-label">
                            PROMOTED
                        </span>

                        <strong
                            className="stat-number"
                            style={{
                                color: "#059669"
                            }}
                        >
                            {
                                statistics.promoted
                            }
                        </strong>

                        <span className="stat-description">
                            On this page
                        </span>

                    </div>

                    <div className="stat-icon promoted">

                        <ArrowUp
                            size={22}
                        />

                    </div>

                </div>


                {/* REPEATED */}

                <div className="stat-card">

                    <div className="stat-content">

                        <span className="stat-label">
                            REPEATED
                        </span>

                        <strong
                            className="stat-number"
                            style={{
                                color: "#c2410c"
                            }}
                        >
                            {
                                statistics.repeated
                            }
                        </strong>

                        <span className="stat-description">
                            On this page
                        </span>

                    </div>

                    <div className="stat-icon repeated">

                        <RotateCcw
                            size={22}
                        />

                    </div>

                </div>


                {/* GRADUATED */}

                <div className="stat-card">

                    <div className="stat-content">

                        <span className="stat-label">
                            GRADUATED
                        </span>

                        <strong
                            className="stat-number"
                            style={{
                                color: "#2563eb"
                            }}
                        >
                            {
                                statistics.graduated
                            }
                        </strong>

                        <span className="stat-description">
                            On this page
                        </span>

                    </div>

                    <div className="stat-icon graduated">

                        <GraduationCap
                            size={22}
                        />

                    </div>

                </div>

            </div>


            {/* =====================================
                FILTER CARD
            ===================================== */}

            <div className="filter-card">

                <div className="filter-heading">

                    <div className="filter-heading-icon">

                        <Filter
                            size={18}
                        />

                    </div>

                    <div>

                        <h5>
                            Search & Filter
                        </h5>

                        <p>
                            Find a student's promotion record.
                        </p>

                    </div>

                </div>


                <div className="filter-grid">


                    {/* SEARCH */}

                    <div className="search-field">

                        <label>
                            Search Student
                        </label>

                        <div className="search-input-wrapper">

                            <Search
                                size={18}
                                className="search-input-icon"
                            />

                            <input
                                type="text"
                                value={
                                    searchInput
                                }
                                onChange={event =>
                                    setSearchInput(
                                        event.target.value
                                    )
                                }
                                onKeyDown={
                                    handleSearchKeyDown
                                }
                                placeholder="Name or admission number..."
                            />

                            {
                                searchInput && (

                                    <button
                                        type="button"
                                        className="clear-search"
                                        onClick={() =>
                                            setSearchInput("")
                                        }
                                    >

                                        <X
                                            size={16}
                                        />

                                    </button>

                                )
                            }

                        </div>

                    </div>


                    {/* ACTION */}

                    <div>

                        <label>
                            Action
                        </label>

                        <select
                            className="form-select"
                            value={
                                action
                            }
                            onChange={
                                handleActionChange
                            }
                        >

                            <option value="">
                                All Actions
                            </option>

                            <option value="Promoted">
                                Promoted
                            </option>

                            <option value="Repeated">
                                Repeated
                            </option>

                            <option value="Graduated">
                                Graduated
                            </option>

                        </select>

                    </div>


                    {/* BUTTONS */}

                    <div className="filter-buttons">

                        <button
                            type="button"
                            className="btn btn-primary search-button"
                            onClick={
                                handleSearch
                            }
                        >

                            <Search
                                size={16}
                                className="me-2"
                            />

                            Search

                        </button>


                        <button
                            type="button"
                            className="btn btn-outline-secondary clear-button"
                            onClick={
                                clearFilters
                            }
                        >

                            Clear

                        </button>

                    </div>

                </div>

            </div>


            {/* =====================================
                RECORDS CARD
            ===================================== */}

            <div className="records-card">


                {/* RECORD HEADER */}

                <div className="records-header">

                    <div>

                        <h5>
                            Promotion Records
                        </h5>

                        <p>

                            Showing{" "}

                            <strong>
                                {
                                    history.length
                                }
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {
                                    pagination.total
                                }
                            </strong>

                            {" "}records

                        </p>

                    </div>

                    {
                        isFetching && (

                            <div className="fetching-indicator">

                                <Loader2
                                    size={15}
                                    className="loading-spinner me-1"
                                />

                                Updating...

                            </div>

                        )
                    }

                </div>


                {/* =================================
                    EMPTY STATE
                ================================= */}

                {
                    history.length === 0
                        ? (

                            <div className="empty-state">

                                <div className="empty-icon">

                                    <FileText
                                        size={30}
                                    />

                                </div>

                                <h5>
                                    No promotion records found
                                </h5>

                                <p>
                                    No records match your current
                                    search or filter.
                                </p>

                                {
                                    (
                                        search ||
                                        action
                                    ) && (

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Clear Filters
                                        </button>

                                    )
                                }

                            </div>

                        )
                        : (

                            <>

                                {/* =========================
                                    TABLE
                                ========================= */}

                                <div className="table-container">

                                    <table className="promotion-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Student
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                                <th>
                                                    Previous Class
                                                </th>

                                                <th>
                                                    Destination
                                                </th>

                                                <th>
                                                    Session
                                                </th>

                                                <th>
                                                    Processed By
                                                </th>

                                                <th>
                                                    Date
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                history.map(
                                                    item => (

                                                        <tr
                                                            key={
                                                                item.id
                                                            }
                                                        >


                                                            {/* STUDENT */}

                                                            <td>

                                                                <div className="student-cell">

                                                                    <div className="student-avatar">

                                                                        {
                                                                            getInitials(
                                                                                item
                                                                            )
                                                                        }

                                                                    </div>

                                                                    <div className="student-details">

                                                                        <div className="student-name">

                                                                            {
                                                                                getStudentName(
                                                                                    item
                                                                                )
                                                                            }

                                                                        </div>

                                                                        <div className="student-admission">

                                                                            {
                                                                                item.admission_number ||
                                                                                "No admission number"
                                                                            }

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            {/* ACTION */}

                                                            <td>

                                                                {
                                                                    getActionBadge(
                                                                        item.action
                                                                    )
                                                                }

                                                            </td>


                                                            {/* PREVIOUS */}

                                                            <td>

                                                                <div className="class-cell">

                                                                    <span className="class-name">

                                                                        {
                                                                            formatPlacement(
                                                                                item.from_class_name,
                                                                                item.from_arm_name
                                                                            )
                                                                        }

                                                                    </span>

                                                                    <span className="class-label">
                                                                        Previous placement
                                                                    </span>

                                                                </div>

                                                            </td>


                                                            {/* DESTINATION */}

                                                            <td>

                                                                {
                                                                    item.to_class_name
                                                                        ? (

                                                                            <div className="destination-cell">

                                                                                <ArrowRight
                                                                                    size={15}
                                                                                    className="destination-arrow"
                                                                                />

                                                                                <div>

                                                                                    <span className="class-name">

                                                                                        {
                                                                                            formatPlacement(
                                                                                                item.to_class_name,
                                                                                                item.to_arm_name
                                                                                            )
                                                                                        }

                                                                                    </span>

                                                                                    <span className="class-label">
                                                                                        New placement
                                                                                    </span>

                                                                                </div>

                                                                            </div>

                                                                        )
                                                                        : (

                                                                            <span className="final-status">

                                                                                <GraduationCap
                                                                                    size={14}
                                                                                />

                                                                                Final

                                                                            </span>

                                                                        )
                                                                }

                                                            </td>


                                                            {/* SESSION */}

                                                            <td>

                                                                <span className="session-badge">

                                                                    {
                                                                        item.from_session_name ||
                                                                        item.to_session_name ||
                                                                        "—"
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* PROCESSED BY */}

                                                            <td>

                                                                <div className="processed-cell">

                                                                    <div className="processed-icon">

                                                                        <UserCheck
                                                                            size={15}
                                                                        />

                                                                    </div>

                                                                    <div>

                                                                        <div className="processed-name">

                                                                            {
                                                                                item.processed_by_username ||
                                                                                "System"
                                                                            }

                                                                        </div>

                                                                        {
                                                                            item.processed_by_admin_type && (

                                                                                <div className="processed-role">

                                                                                    {
                                                                                        item.processed_by_admin_type
                                                                                            .replace(
                                                                                                /_/g,
                                                                                                " "
                                                                                            )
                                                                                    }

                                                                                </div>

                                                                            )
                                                                        }

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            {/* DATE */}

                                                            <td>

                                                                <div className="date-cell">

                                                                    <div>

                                                                        {
                                                                            formatDate(
                                                                                item.processed_at
                                                                            )
                                                                        }

                                                                    </div>

                                                                    <span>

                                                                        <Clock
                                                                            size={12}
                                                                            className="me-1"
                                                                        />

                                                                        {
                                                                            formatTime(
                                                                                item.processed_at
                                                                            )
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>


                                {/* =========================
                                    PAGINATION
                                ========================= */}

                                {
                                    pagination.totalPages > 1 && (

                                        <div className="pagination-container">

                                            <div className="pagination-info">

                                                Page{" "}

                                                <strong>
                                                    {
                                                        pagination.page
                                                    }
                                                </strong>

                                                {" "}of{" "}

                                                <strong>
                                                    {
                                                        pagination.totalPages
                                                    }
                                                </strong>

                                            </div>


                                            <div className="pagination-buttons">

                                                <button
                                                    type="button"
                                                    className="pagination-button"
                                                    disabled={
                                                        pagination.page <= 1 ||
                                                        isFetching
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            previous =>
                                                                previous - 1
                                                        )
                                                    }
                                                >

                                                    <ChevronLeft
                                                        size={16}
                                                    />

                                                    Previous

                                                </button>


                                                <button
                                                    type="button"
                                                    className="pagination-button primary"
                                                    disabled={
                                                        pagination.page >=
                                                            pagination.totalPages ||
                                                        isFetching
                                                    }
                                                    onClick={() =>
                                                        setPage(
                                                            previous =>
                                                                previous + 1
                                                        )
                                                    }
                                                >

                                                    Next

                                                    <ChevronRight
                                                        size={16}
                                                    />

                                                </button>

                                            </div>

                                        </div>

                                    )
                                }

                            </>

                        )
                }

            </div>


            {/* =====================================
                SMALL INFORMATION NOTE
            ===================================== */}

            {
                history.length > 0 && (

                    <div className="history-note">

                        <Clock
                            size={15}
                        />

                        <span>
                            Promotion history records are permanent
                            academic audit records and should not be
                            modified without proper authorization.
                        </span>

                    </div>

                )
            }

        </div>

    );

}


/*
=========================================
PAGE STYLES
=========================================
*/

const pageStyles = `

    .promotion-page {
        min-height: 100vh;
        background: #f5f7fb;
        padding: 24px;
        color: #1e293b;
    }

    /* =====================================
       HEADER
    ===================================== */

    .promotion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 22px;
    }

    .promotion-header > div {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .header-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #eef2ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .promotion-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.3px;
    }

    .promotion-header p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 14px;
    }

    .refresh-button {
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #334155;
        border-radius: 9px;
        padding: 9px 15px;
        font-weight: 600;
    }

    /* =====================================
       STATISTICS
    ===================================== */

    .statistics-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 18px;
    }

    .stat-card {
        background: #ffffff;
        border: 1px solid #e6eaf0;
        border-radius: 13px;
        padding: 18px;
        min-height: 126px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .stat-content {
        min-width: 0;
    }

    .stat-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #64748b;
    }

    .stat-number {
        display: block;
        margin-top: 6px;
        font-size: 27px;
        line-height: 1;
        color: #0f172a;
        font-weight: 750;
    }

    .stat-description {
        display: block;
        margin-top: 8px;
        color: #94a3b8;
        font-size: 12px;
    }

    .stat-icon {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-icon.total {
        background: #eff6ff;
        color: #2563eb;
    }

    .stat-icon.promoted {
        background: #ecfdf5;
        color: #059669;
    }

    .stat-icon.repeated {
        background: #fff7ed;
        color: #c2410c;
    }

    .stat-icon.graduated {
        background: #eef2ff;
        color: #4f46e5;
    }

    /* =====================================
       FILTER
    ===================================== */

    .filter-card {
        background: #ffffff;
        border: 1px solid #e6eaf0;
        border-radius: 13px;
        padding: 20px;
        margin-bottom: 18px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .filter-heading {
        display: flex;
        align-items: center;
        gap: 11px;
        margin-bottom: 17px;
    }

    .filter-heading-icon {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        background: #eef2ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .filter-heading h5 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
    }

    .filter-heading p {
        margin: 3px 0 0;
        color: #64748b;
        font-size: 12px;
    }

    .filter-grid {
        display: grid;
        grid-template-columns: minmax(280px, 1fr) 220px auto;
        gap: 14px;
        align-items: end;
    }

    .filter-grid label {
        display: block;
        margin-bottom: 7px;
        font-size: 12px;
        font-weight: 650;
        color: #334155;
    }

    .search-input-wrapper {
        position: relative;
    }

    .search-input-wrapper input {
        width: 100%;
        height: 42px;
        border: 1px solid #dbe2ea;
        border-radius: 9px;
        padding: 0 40px;
        font-size: 13px;
        color: #1e293b;
        outline: none;
        transition: border-color .15s, box-shadow .15s;
    }

    .search-input-wrapper input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, .1);
    }

    .search-input-icon {
        position: absolute;
        left: 13px;
        top: 12px;
        color: #94a3b8;
    }

    .clear-search {
        position: absolute;
        right: 9px;
        top: 8px;
        width: 26px;
        height: 26px;
        border: 0;
        border-radius: 6px;
        background: #f1f5f9;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .filter-grid select {
        height: 42px;
        border-radius: 9px;
        border-color: #dbe2ea;
        font-size: 13px;
        box-shadow: none;
    }

    .filter-buttons {
        display: flex;
        gap: 8px;
    }

    .search-button {
        height: 42px;
        border-radius: 9px;
        padding: 0 17px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
    }

    .clear-button {
        height: 42px;
        border-radius: 9px;
        padding: 0 15px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
    }

    /* =====================================
       RECORDS
    ===================================== */

    .records-card {
        background: #ffffff;
        border: 1px solid #e6eaf0;
        border-radius: 13px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    }

    .records-header {
        min-height: 72px;
        padding: 17px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        border-bottom: 1px solid #eef1f5;
    }

    .records-header h5 {
        margin: 0;
        color: #0f172a;
        font-size: 15px;
        font-weight: 700;
    }

    .records-header p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 12px;
    }

    .fetching-indicator {
        display: flex;
        align-items: center;
        color: #64748b;
        font-size: 12px;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
    }

    .promotion-table {
        width: 100%;
        min-width: 1080px;
        border-collapse: collapse;
        margin: 0;
    }

    .promotion-table thead {
        background: #f8fafc;
    }

    .promotion-table th {
        padding: 12px 16px;
        text-align: left;
        color: #64748b;
        font-size: 10px;
        font-weight: 750;
        letter-spacing: .5px;
        text-transform: uppercase;
        white-space: nowrap;
        border-bottom: 1px solid #e8edf3;
    }

    .promotion-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #f0f2f5;
        vertical-align: middle;
        font-size: 13px;
        color: #334155;
    }

    .promotion-table tbody tr {
        transition: background .12s;
    }

    .promotion-table tbody tr:hover {
        background: #fafbff;
    }

    .promotion-table tbody tr:last-child td {
        border-bottom: 0;
    }

    /* =====================================
       STUDENT
    ===================================== */

    .student-cell {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 190px;
    }

    .student-avatar {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #eef2ff;
        color: #4338ca;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 750;
        flex-shrink: 0;
    }

    .student-details {
        min-width: 0;
    }

    .student-name {
        color: #0f172a;
        font-size: 13px;
        font-weight: 650;
        white-space: nowrap;
    }

    .student-admission {
        margin-top: 3px;
        color: #94a3b8;
        font-size: 11px;
    }

    /* =====================================
       STATUS
    ===================================== */

    .promotion-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 9px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
    }

    .promotion-status.promoted {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #bbf7d0;
    }

    .promotion-status.repeated {
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #fed7aa;
    }

    .promotion-status.graduated {
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
    }

    .promotion-status.default {
        background: #f1f5f9;
        color: #475569;
    }

    /* =====================================
       CLASS
    ===================================== */

    .class-cell,
    .destination-cell {
        display: flex;
        align-items: center;
        gap: 7px;
    }

    .class-cell {
        min-width: 130px;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
    }

    .destination-cell {
        min-width: 140px;
    }

    .destination-arrow {
        color: #94a3b8;
        flex-shrink: 0;
    }

    .class-name {
        color: #334155;
        font-weight: 600;
        font-size: 12px;
        white-space: nowrap;
    }

    .class-label {
        color: #94a3b8;
        font-size: 10px;
        white-space: nowrap;
    }

    .final-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f1f5f9;
        color: #475569;
        border-radius: 7px;
        padding: 6px 9px;
        font-size: 11px;
        font-weight: 650;
    }

    .session-badge {
        display: inline-block;
        background: #f1f5f9;
        color: #475569;
        padding: 6px 9px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 650;
        white-space: nowrap;
    }

    /* =====================================
       PROCESSED BY
    ===================================== */

    .processed-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 125px;
    }

    .processed-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: #f1f5f9;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .processed-name {
        color: #334155;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }

    .processed-role {
        margin-top: 2px;
        color: #94a3b8;
        font-size: 10px;
        text-transform: capitalize;
        white-space: nowrap;
    }

    /* =====================================
       DATE
    ===================================== */

    .date-cell {
        min-width: 105px;
        color: #475569;
        font-size: 12px;
        white-space: nowrap;
    }

    .date-cell span {
        display: flex;
        align-items: center;
        margin-top: 3px;
        color: #94a3b8;
        font-size: 10px;
    }

    /* =====================================
       PAGINATION
    ===================================== */

    .pagination-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 14px 20px;
        border-top: 1px solid #eef1f5;
    }

    .pagination-info {
        color: #64748b;
        font-size: 12px;
    }

    .pagination-buttons {
        display: flex;
        gap: 7px;
    }

    .pagination-button {
        height: 35px;
        padding: 0 12px;
        border: 1px solid #dbe2ea;
        background: #ffffff;
        color: #475569;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 600;
    }

    .pagination-button:hover:not(:disabled) {
        background: #f8fafc;
    }

    .pagination-button.primary {
        background: #2563eb;
        color: #ffffff;
        border-color: #2563eb;
    }

    .pagination-button:disabled {
        opacity: .5;
        cursor: not-allowed;
    }

    /* =====================================
       EMPTY STATE
    ===================================== */

    .empty-state {
        text-align: center;
        padding: 65px 20px;
    }

    .empty-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 15px;
        border-radius: 50%;
        background: #f1f5f9;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .empty-state h5 {
        margin-bottom: 5px;
        color: #0f172a;
        font-size: 15px;
        font-weight: 700;
    }

    .empty-state p {
        margin-bottom: 15px;
        color: #64748b;
        font-size: 13px;
    }

    /* =====================================
       LOADING
    ===================================== */

    .promotion-loading {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .loading-icon {
        width: 58px;
        height: 58px;
        border-radius: 14px;
        background: #eef2ff;
        color: #4f46e5;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
    }

    .promotion-loading h5 {
        margin: 0 0 5px;
        color: #0f172a;
        font-weight: 700;
    }

    .promotion-loading p {
        margin: 0;
        color: #64748b;
        font-size: 13px;
    }

    .loading-spinner {
        animation: promotion-spin 1s linear infinite;
    }

    @keyframes promotion-spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    /* =====================================
       ERROR
    ===================================== */

    .promotion-error {
        max-width: 700px;
        margin: 70px auto;
        padding: 22px;
        border: 1px solid #fecaca;
        background: #fffafa;
        border-radius: 13px;
        display: flex;
        gap: 14px;
    }

    .error-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: #fef2f2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .promotion-error h5 {
        margin: 0 0 5px;
        color: #991b1b;
        font-weight: 700;
    }

    .promotion-error p {
        margin: 0 0 15px;
        color: #7f1d1d;
        font-size: 13px;
    }

    /* =====================================
       NOTE
    ===================================== */

    .history-note {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding: 10px 13px;
        color: #64748b;
        font-size: 11px;
    }

    /* =====================================
       RESPONSIVE
    ===================================== */

    @media (max-width: 1100px) {

        .statistics-grid {
            grid-template-columns:
                repeat(2, minmax(0, 1fr));
        }

        .filter-grid {
            grid-template-columns:
                minmax(0, 1fr) 200px;
        }

        .filter-buttons {
            grid-column: 1 / -1;
        }

    }


    @media (max-width: 700px) {

        .promotion-page {
            padding: 15px;
        }

        .promotion-header {
            align-items: flex-start;
            flex-direction: column;
        }

        .refresh-button {
            width: 100%;
        }

        .statistics-grid {
            grid-template-columns: 1fr;
        }

        .filter-grid {
            grid-template-columns: 1fr;
        }

        .filter-buttons {
            grid-column: auto;
        }

        .search-button,
        .clear-button {
            flex: 1;
        }

        .records-header {
            align-items: flex-start;
            flex-direction: column;
        }

        .pagination-container {
            align-items: flex-start;
            flex-direction: column;
        }

        .pagination-buttons {
            width: 100%;
        }

        .pagination-button {
            flex: 1;
            justify-content: center;
        }

    }

`;


export default StudentPromotionHistoryPage;