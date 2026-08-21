import {
    useMemo,
    useState,
    useEffect
} from "react";

import {
    useNavigate
} from "react-router-dom";


import { Input } from "@/components/ui/Input";

import { Button } from "@/components/ui/Button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/Card";

import { Badge } from "@/components/ui/badge";


import {
    Users,
    Wallet,
    CreditCard,
    AlertCircle,
    Search,
    Eye,
    RefreshCw,
    CalendarDays
} from "lucide-react";


import {
    useParentFinancialOverview
} from "@/hooks/useParentFinancialOverview";


import {
    useTerms
} from "@/hooks/useTerms";



/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (amount) => {

    return `₦${Number(
        amount || 0
    ).toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

};



/*
|--------------------------------------------------------------------------
| GET PAYMENT STATUS
|--------------------------------------------------------------------------
*/

const getPaymentStatus = (parent) => {

    const outstanding =
        Number(
            parent.outstanding || 0
        );


    const paid =
        Number(
            parent.total_paid || 0
        );


    const expected =
        Number(
            parent.total_expected || 0
        );


    if (
        outstanding > 0 &&
        paid === 0
    ) {

        return "OWING";

    }


    if (
        outstanding > 0
    ) {

        return "PARTLY_PAID";

    }


    /*
    |--------------------------------------------------------------------------
    | If there is no outstanding balance,
    | consider the parent paid.
    |--------------------------------------------------------------------------
    */

    if (
        outstanding <= 0 &&
        expected > 0
    ) {

        return "PAID";

    }


    return "PAID";

};



/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function ParentFinancialOverview() {


    const navigate =
        useNavigate();



    /*
    |--------------------------------------------------------------------------
    | TERMS
    |--------------------------------------------------------------------------
    |
    | We use the terms endpoint to obtain both:
    |
    | session_id
    | session_name
    | term id
    | term_name
    | is_current
    |
    |--------------------------------------------------------------------------
    */

    const {
        data: terms = [],
        isLoading: termsLoading,
        error: termsError
    } = useTerms();



    /*
    |--------------------------------------------------------------------------
    | SELECTED SESSION
    |--------------------------------------------------------------------------
    */

    const [
        selectedSessionId,
        setSelectedSessionId
    ] = useState("");



    /*
    |--------------------------------------------------------------------------
    | SELECTED TERM
    |--------------------------------------------------------------------------
    */

    const [
        selectedTermId,
        setSelectedTermId
    ] = useState("");



    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch
    ] = useState("");



    /*
    |--------------------------------------------------------------------------
    | STATUS FILTER
    |--------------------------------------------------------------------------
    */

    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");



    /*
    |--------------------------------------------------------------------------
    | PREPARE SESSIONS
    |--------------------------------------------------------------------------
    |
    | Your getTerms() endpoint already gives us session_id and session_name.
    | We remove duplicates here.
    |
    |--------------------------------------------------------------------------
    */

    const sessions = useMemo(() => {

        const sessionMap =
            new Map();


        terms.forEach((term) => {

            if (
                !sessionMap.has(
                    term.session_id
                )
            ) {

                sessionMap.set(
                    term.session_id,
                    {
                        id:
                            term.session_id,

                        session_name:
                            term.session_name
                    }
                );

            }

        });


        return Array.from(
            sessionMap.values()
        );

    }, [terms]);



    /*
    |--------------------------------------------------------------------------
    | INITIAL SESSION / TERM
    |--------------------------------------------------------------------------
    |
    | When terms are loaded:
    |
    | 1. Find the current term.
    | 2. Select its session.
    | 3. Select the current term.
    |
    | This removes the need for hardcoded IDs.
    |
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (
            !terms.length
        ) {

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | If we already have a valid selection,
        | don't overwrite it.
        |--------------------------------------------------------------------------
        */

        if (
            selectedSessionId &&
            selectedTermId
        ) {

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Find current term
        |--------------------------------------------------------------------------
        */

        const currentTerm =
            terms.find(
                (term) =>
                    term.is_current === true
            );


        if (currentTerm) {

            setSelectedSessionId(
                String(
                    currentTerm.session_id
                )
            );


            setSelectedTermId(
                String(
                    currentTerm.id
                )
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Fallback to first term
        |--------------------------------------------------------------------------
        */

        const firstTerm =
            terms[0];


        setSelectedSessionId(
            String(
                firstTerm.session_id
            )
        );


        setSelectedTermId(
            String(
                firstTerm.id
            )
        );


    }, [
        terms,
        selectedSessionId,
        selectedTermId
    ]);



    /*
    |--------------------------------------------------------------------------
    | TERMS FOR SELECTED SESSION
    |--------------------------------------------------------------------------
    */

    const filteredTerms =
        useMemo(() => {

            if (
                !selectedSessionId
            ) {

                return [];

            }


            return terms.filter(
                (term) =>
                    String(
                        term.session_id
                    ) ===
                    String(
                        selectedSessionId
                    )
            );

        }, [
            terms,
            selectedSessionId
        ]);



    /*
    |--------------------------------------------------------------------------
    | SELECTED TERM OBJECT
    |--------------------------------------------------------------------------
    */

    const selectedTerm =
        useMemo(() => {

            return terms.find(
                (term) =>
                    String(term.id) ===
                    String(selectedTermId)
            );

        }, [
            terms,
            selectedTermId
        ]);



    /*
    |--------------------------------------------------------------------------
    | FINANCIAL DATA
    |--------------------------------------------------------------------------
    */

    const {
        data: parents = [],
        isLoading: parentsLoading,
        isFetching,
        error,
        refetch
    } = useParentFinancialOverview(
        selectedSessionId,
        selectedTermId
    );



    /*
    |--------------------------------------------------------------------------
    | HANDLE SESSION CHANGE
    |--------------------------------------------------------------------------
    */

    const handleSessionChange = (
        event
    ) => {

        const newSessionId =
            event.target.value;


        setSelectedSessionId(
            newSessionId
        );


        /*
        |--------------------------------------------------------------------------
        | Automatically select the first
        | term belonging to that session.
        |--------------------------------------------------------------------------
        */

        const firstTerm =
            terms.find(
                (term) =>
                    String(
                        term.session_id
                    ) ===
                    String(
                        newSessionId
                    )
            );


        if (firstTerm) {

            setSelectedTermId(
                String(
                    firstTerm.id
                )
            );

        } else {

            setSelectedTermId("");

        }

    };



    /*
    |--------------------------------------------------------------------------
    | HANDLE TERM CHANGE
    |--------------------------------------------------------------------------
    */

    const handleTermChange = (
        event
    ) => {

        setSelectedTermId(
            event.target.value
        );

    };



    /*
    |--------------------------------------------------------------------------
    | FILTER PARENTS
    |--------------------------------------------------------------------------
    */

    const filteredParents =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return parents.filter(
                (parent) => {


                    /*
                    |--------------------------------------------------------------------------
                    | FULL NAME
                    |--------------------------------------------------------------------------
                    */

                    const fullName = `
                        ${parent.surname || ""}
                        ${parent.first_name || ""}
                        ${parent.middle_name || ""}
                    `
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim()
                        .toLowerCase();


                    /*
                    |--------------------------------------------------------------------------
                    | PHONE
                    |--------------------------------------------------------------------------
                    */

                    const phone =
                        String(
                            parent.phone_number ||
                                ""
                        )
                            .toLowerCase();


                    /*
                    |--------------------------------------------------------------------------
                    | EMAIL
                    |--------------------------------------------------------------------------
                    */

                    const email =
                        String(
                            parent.email ||
                                ""
                        )
                            .toLowerCase();


                    /*
                    |--------------------------------------------------------------------------
                    | SEARCH MATCH
                    |--------------------------------------------------------------------------
                    */

                    const searchMatch =
                        !searchValue ||
                        fullName.includes(
                            searchValue
                        ) ||
                        phone.includes(
                            searchValue
                        ) ||
                        email.includes(
                            searchValue
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | PAYMENT STATUS
                    |--------------------------------------------------------------------------
                    */

                    const status =
                        getPaymentStatus(
                            parent
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | STATUS MATCH
                    |--------------------------------------------------------------------------
                    */

                    const statusMatch =
                        statusFilter ===
                            "ALL" ||
                        status ===
                            statusFilter;


                    return (
                        searchMatch &&
                        statusMatch
                    );

                }
            );

        }, [
            parents,
            search,
            statusFilter
        ]);



    /*
    |--------------------------------------------------------------------------
    | TOTALS
    |--------------------------------------------------------------------------
    */

    const totals =
        useMemo(() => {

            return parents.reduce(
                (
                    acc,
                    parent
                ) => {

                    acc.expected +=
                        Number(
                            parent.total_expected ||
                                0
                        );


                    acc.paid +=
                        Number(
                            parent.total_paid ||
                                0
                        );


                    acc.outstanding +=
                        Number(
                            parent.outstanding ||
                                0
                        );


                    return acc;

                },
                {
                    expected: 0,
                    paid: 0,
                    outstanding: 0
                }
            );

        }, [
            parents
        ]);



    /*
    |--------------------------------------------------------------------------
    | STATUS COUNTS
    |--------------------------------------------------------------------------
    */

    const statusCounts =
        useMemo(() => {

            let owing = 0;

            let partlyPaid = 0;

            let paid = 0;


            parents.forEach(
                (parent) => {

                    const status =
                        getPaymentStatus(
                            parent
                        );


                    if (
                        status ===
                        "OWING"
                    ) {

                        owing++;

                    } else if (
                        status ===
                        "PARTLY_PAID"
                    ) {

                        partlyPaid++;

                    } else {

                        paid++;

                    }

                }
            );


            return {
                owing,
                partlyPaid,
                paid
            };

        }, [
            parents
        ]);



    /*
    |--------------------------------------------------------------------------
    | VIEW FINANCIAL DETAILS
    |--------------------------------------------------------------------------
    |
    | Backend route:
    |
    | /api/parents/financial-overview/:parentId/:sessionId/:termId
    |
    |--------------------------------------------------------------------------
    */

    const handleViewParent = (parentId) => {

        navigate(
            `/parents/financial/${parentId}?sessionId=${selectedSessionId}&termId=${selectedTermId}`
        );

    };



    /*
    |--------------------------------------------------------------------------
    | TERMS LOADING
    |--------------------------------------------------------------------------
    */

    if (
        termsLoading
    ) {

        return (

            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        className="mx-auto mb-3 h-6 w-6 animate-spin"
                    />


                    <p className="text-muted-foreground">

                        Loading academic sessions and terms...

                    </p>

                </div>

            </div>

        );

    }



    /*
    |--------------------------------------------------------------------------
    | TERMS ERROR
    |--------------------------------------------------------------------------
    */

    if (
        termsError
    ) {

        return (

            <div className="p-6">

                <Card>

                    <CardContent className="py-10 text-center">

                        <AlertCircle
                            className="mx-auto mb-4 h-10 w-10 text-red-500"
                        />


                        <h2 className="mb-2 text-lg font-semibold">

                            Unable to load academic terms

                        </h2>


                        <p className="text-sm text-muted-foreground">

                            {termsError?.response?.data?.message ||
                                termsError?.message ||
                                "Unable to load academic sessions and terms."}

                        </p>

                    </CardContent>

                </Card>

            </div>

        );

    }



    /*
    |--------------------------------------------------------------------------
    | FINANCIAL DATA LOADING
    |--------------------------------------------------------------------------
    */

    if (
        parentsLoading
    ) {

        return (

            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        className="mx-auto mb-3 h-6 w-6 animate-spin"
                    />


                    <p className="text-muted-foreground">

                        Loading parent financial information...

                    </p>

                </div>

            </div>

        );

    }



    /*
    |--------------------------------------------------------------------------
    | FINANCIAL ERROR
    |--------------------------------------------------------------------------
    */

    if (
        error
    ) {

        return (

            <div className="p-6">

                <Card>

                    <CardContent className="py-10 text-center">

                        <AlertCircle
                            className="mx-auto mb-4 h-10 w-10 text-red-500"
                        />


                        <h2 className="mb-2 text-lg font-semibold">

                            Unable to load financial information

                        </h2>


                        <p className="mb-4 text-sm text-muted-foreground">

                            {error?.response?.data?.message ||
                                error?.message ||
                                "Something went wrong while loading parent financial information."}

                        </p>


                        <Button
                            onClick={() =>
                                refetch()
                            }
                        >

                            <RefreshCw className="mr-2 h-4 w-4" />

                            Try Again

                        </Button>

                    </CardContent>

                </Card>

            </div>

        );

    }



    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <div className="space-y-6 p-6">


            {/* =========================================================
                PAGE HEADER
            ========================================================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-2xl font-bold">

                        Parent Financial Overview

                    </h1>


                    <p className="text-muted-foreground">

                        Monitor parents' fee obligations,
                        payments and outstanding balances.

                    </p>

                </div>


                <Button
                    variant="outline"
                    onClick={() =>
                        refetch()
                    }
                    disabled={
                        isFetching
                    }
                >

                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                            isFetching
                                ? "animate-spin"
                                : ""
                        }`}
                    />

                    Refresh

                </Button>

            </div>



            {/* =========================================================
                SESSION / TERM SELECTOR
            ========================================================= */}

            <Card>

                <CardHeader>

                    <CardTitle className="flex items-center gap-2">

                        <CalendarDays
                            className="h-5 w-5"
                        />

                        Financial Period

                    </CardTitle>

                </CardHeader>


                <CardContent>

                    <div className="grid gap-4 md:grid-cols-2">


                        {/* SESSION */}

                        <div className="space-y-2">

                            <label
                                htmlFor="session"
                                className="text-sm font-medium"
                            >

                                Academic Session

                            </label>


                            <select
                                id="session"
                                value={
                                    selectedSessionId
                                }
                                onChange={
                                    handleSessionChange
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >

                                <option value="">

                                    Select academic session

                                </option>


                                {sessions.map(
                                    (session) => (

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

                        <div className="space-y-2">

                            <label
                                htmlFor="term"
                                className="text-sm font-medium"
                            >

                                Term

                            </label>


                            <select
                                id="term"
                                value={
                                    selectedTermId
                                }
                                onChange={
                                    handleTermChange
                                }
                                disabled={
                                    !selectedSessionId
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <option value="">

                                    Select term

                                </option>


                                {filteredTerms.map(
                                    (term) => (

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

                                            {term.is_current
                                                ? " (Current)"
                                                : ""}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>



                    {/* SELECTED PERIOD */}

                    {selectedTerm && (

                        <div className="mt-4 flex flex-col gap-2 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-sm text-muted-foreground">

                                    Showing financial records for

                                </p>


                                <p className="font-semibold">

                                    {
                                        selectedTerm.session_name
                                    }

                                    {" — "}

                                    {
                                        selectedTerm.term_name
                                    }

                                </p>

                            </div>


                            {selectedTerm.is_current && (

                                <Badge>

                                    Current Term

                                </Badge>

                            )}

                        </div>

                    )}

                </CardContent>

            </Card>



            {/* =========================================================
                SUMMARY CARDS
            ========================================================= */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                {/* TOTAL PARENTS */}

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between pb-2">

                        <CardTitle className="text-sm font-medium">

                            Total Parents

                        </CardTitle>


                        <Users className="h-5 w-5" />

                    </CardHeader>


                    <CardContent>

                        <div className="text-2xl font-bold">

                            {
                                parents.length
                            }

                        </div>


                        <p className="mt-1 text-xs text-muted-foreground">

                            Parents with financial records

                        </p>

                    </CardContent>

                </Card>



                {/* EXPECTED */}

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between pb-2">

                        <CardTitle className="text-sm font-medium">

                            Total Expected

                        </CardTitle>


                        <Wallet className="h-5 w-5" />

                    </CardHeader>


                    <CardContent>

                        <div className="text-2xl font-bold">

                            {
                                formatCurrency(
                                    totals.expected
                                )
                            }

                        </div>


                        <p className="mt-1 text-xs text-muted-foreground">

                            Current selected period obligations

                        </p>

                    </CardContent>

                </Card>



                {/* PAID */}

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between pb-2">

                        <CardTitle className="text-sm font-medium">

                            Total Paid

                        </CardTitle>


                        <CreditCard className="h-5 w-5" />

                    </CardHeader>


                    <CardContent>

                        <div className="text-2xl font-bold">

                            {
                                formatCurrency(
                                    totals.paid
                                )
                            }

                        </div>


                        <p className="mt-1 text-xs text-muted-foreground">

                            Payments received

                        </p>

                    </CardContent>

                </Card>



                {/* OUTSTANDING */}

                <Card>

                    <CardHeader className="flex flex-row items-center justify-between pb-2">

                        <CardTitle className="text-sm font-medium">

                            Outstanding

                        </CardTitle>


                        <AlertCircle className="h-5 w-5" />

                    </CardHeader>


                    <CardContent>

                        <div className="text-2xl font-bold">

                            {
                                formatCurrency(
                                    totals.outstanding
                                )
                            }

                        </div>


                        <p className="mt-1 text-xs text-muted-foreground">

                            Amount still owed

                        </p>

                    </CardContent>

                </Card>

            </div>



            {/* =========================================================
                STATUS SUMMARY
            ========================================================= */}

            <div className="grid gap-4 sm:grid-cols-3">


                {/* OWING */}

                <Card>

                    <CardContent className="pt-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-muted-foreground">

                                    Owing

                                </p>


                                <p className="text-2xl font-bold">

                                    {
                                        statusCounts.owing
                                    }

                                </p>

                            </div>


                            <Badge variant="destructive">

                                Owing

                            </Badge>

                        </div>

                    </CardContent>

                </Card>



                {/* PARTLY PAID */}

                <Card>

                    <CardContent className="pt-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-muted-foreground">

                                    Partly Paid

                                </p>


                                <p className="text-2xl font-bold">

                                    {
                                        statusCounts.partlyPaid
                                    }

                                </p>

                            </div>


                            <Badge variant="secondary">

                                Partly Paid

                            </Badge>

                        </div>

                    </CardContent>

                </Card>



                {/* PAID */}

                <Card>

                    <CardContent className="pt-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-muted-foreground">

                                    Fully Paid

                                </p>


                                <p className="text-2xl font-bold">

                                    {
                                        statusCounts.paid
                                    }

                                </p>

                            </div>


                            <Badge>

                                Paid

                            </Badge>

                        </div>

                    </CardContent>

                </Card>

            </div>



            {/* =========================================================
                SEARCH / FILTER
            ========================================================= */}

            <Card>

                <CardContent className="pt-6">

                    <div className="flex flex-col gap-4 lg:flex-row">


                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            />


                            <Input

                                className="pl-9"

                                placeholder="Search parent by name, phone or email..."

                                value={
                                    search
                                }

                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }

                            />

                        </div>



                        {/* STATUS FILTER */}

                        <div className="flex flex-wrap gap-2">


                            <Button

                                variant={
                                    statusFilter ===
                                        "ALL"
                                        ? "default"
                                        : "outline"
                                }

                                onClick={() =>
                                    setStatusFilter(
                                        "ALL"
                                    )
                                }

                            >

                                All ({
                                    parents.length
                                })

                            </Button>


                            <Button

                                variant={
                                    statusFilter ===
                                        "OWING"
                                        ? "default"
                                        : "outline"
                                }

                                onClick={() =>
                                    setStatusFilter(
                                        "OWING"
                                    )
                                }

                            >

                                Owing ({
                                    statusCounts.owing
                                })

                            </Button>


                            <Button

                                variant={
                                    statusFilter ===
                                        "PARTLY_PAID"
                                        ? "default"
                                        : "outline"
                                }

                                onClick={() =>
                                    setStatusFilter(
                                        "PARTLY_PAID"
                                    )
                                }

                            >

                                Partly Paid ({
                                    statusCounts.partlyPaid
                                })

                            </Button>


                            <Button

                                variant={
                                    statusFilter ===
                                        "PAID"
                                        ? "default"
                                        : "outline"
                                }

                                onClick={() =>
                                    setStatusFilter(
                                        "PAID"
                                    )
                                }

                            >

                                Paid ({
                                    statusCounts.paid
                                })

                            </Button>

                        </div>

                    </div>

                </CardContent>

            </Card>



            {/* =========================================================
                PARENT TABLE
            ========================================================= */}

            <Card>

                <CardHeader>

                    <CardTitle>

                        Parent Financial Records

                    </CardTitle>

                </CardHeader>


                <CardContent>

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">


                            <thead>

                                <tr className="border-b text-left">

                                    <th className="p-3">

                                        Parent

                                    </th>


                                    <th className="p-3">

                                        Children

                                    </th>


                                    <th className="p-3">

                                        Expected

                                    </th>


                                    <th className="p-3">

                                        Previous Balance

                                    </th>


                                    <th className="p-3">

                                        Paid

                                    </th>


                                    <th className="p-3">

                                        Outstanding

                                    </th>


                                    <th className="p-3">

                                        Status

                                    </th>


                                    <th className="p-3 text-right">

                                        Action

                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredParents.map(
                                    (parent) => {

                                        const status =
                                            getPaymentStatus(
                                                parent
                                            );


                                        return (

                                            <tr

                                                key={
                                                    parent.parent_id
                                                }

                                                className="border-b transition-colors hover:bg-muted/50"

                                            >


                                                {/* PARENT */}

                                                <td className="p-3">

                                                    <div className="font-medium">

                                                        {
                                                            parent.surname
                                                        }{" "}

                                                        {
                                                            parent.first_name
                                                        }{" "}

                                                        {
                                                            parent.middle_name ||
                                                            ""
                                                        }

                                                    </div>


                                                    <div className="text-xs text-muted-foreground">

                                                        {
                                                            parent.phone_number
                                                        }

                                                    </div>


                                                    {parent.email && (

                                                        <div className="text-xs text-muted-foreground">

                                                            {
                                                                parent.email
                                                            }

                                                        </div>

                                                    )}

                                                </td>



                                                {/* CHILDREN */}

                                                <td className="p-3">

                                                    <Badge variant="outline">

                                                        {
                                                            parent.number_of_children
                                                        }

                                                    </Badge>

                                                </td>



                                                {/* EXPECTED */}

                                                <td className="p-3">

                                                    {
                                                        formatCurrency(
                                                            parent.total_expected
                                                        )
                                                    }

                                                </td>



                                                {/* PREVIOUS BALANCE */}

                                                <td className="p-3">

                                                    {
                                                        formatCurrency(
                                                            parent.previous_balance
                                                        )
                                                    }

                                                </td>



                                                {/* PAID */}

                                                <td className="p-3">

                                                    {
                                                        formatCurrency(
                                                            parent.total_paid
                                                        )
                                                    }

                                                </td>



                                                {/* OUTSTANDING */}

                                                <td className="p-3 font-semibold">

                                                    {
                                                        formatCurrency(
                                                            parent.outstanding
                                                        )
                                                    }

                                                </td>



                                                {/* STATUS */}

                                                <td className="p-3">


                                                    {status ===
                                                        "PAID" && (

                                                        <Badge>

                                                            Paid

                                                        </Badge>

                                                    )}


                                                    {status ===
                                                        "OWING" && (

                                                        <Badge
                                                            variant="destructive"
                                                        >

                                                            Owing

                                                        </Badge>

                                                    )}


                                                    {status ===
                                                        "PARTLY_PAID" && (

                                                        <Badge
                                                            variant="secondary"
                                                        >

                                                            Partly Paid

                                                        </Badge>

                                                    )}

                                                </td>



                                                {/* ACTION */}

                                                <td className="p-3 text-right">

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleViewParent(
                                                                parent.parent_id
                                                            )
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />

                                                        View
                                                    </Button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>



                        {/* EMPTY STATE */}

                        {filteredParents.length ===
                            0 && (

                            <div className="py-10 text-center">

                                <Users
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                />


                                <p className="font-medium">

                                    No parents found

                                </p>


                                <p className="text-sm text-muted-foreground">

                                    Try changing your search,
                                    payment status or financial period.

                                </p>

                            </div>

                        )}

                    </div>

                </CardContent>

            </Card>

        </div>

    );

}


export default ParentFinancialOverview;