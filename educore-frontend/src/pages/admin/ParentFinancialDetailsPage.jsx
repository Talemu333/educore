import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
    ArrowLeft,
    User,
    Users,
    Phone,
    Mail,
    GraduationCap,
    Wallet,
    CreditCard,
    AlertCircle,
    RefreshCw,
    Receipt,
    Building2
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { useParentFinancialDetails } from "@/hooks/useParentFinancialDetails";
import { useTerms } from "@/hooks/useTerms";


const formatCurrency = (amount) => {

    return `₦${Number(amount || 0).toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

};


const getPaymentStatus = (
    outstanding,
    paid
) => {

    outstanding = Number(outstanding || 0);

    paid = Number(paid || 0);


    if (outstanding <= 0) {

        return "PAID";

    }


    if (paid <= 0) {

        return "OWING";

    }


    return "PARTLY_PAID";

};


function ParentFinancialDetailsPage() {

    const navigate = useNavigate();

    const { parentId } = useParams();


    const [searchParams] = useSearchParams();

    const sessionId = searchParams.get("sessionId");

    const termId = searchParams.get("termId");


    const {
        data: terms = []
    } = useTerms();


    const selectedTerm = useMemo(() => {

        return terms.find(
            (term) =>
                String(term.id) === String(termId) &&
                String(term.session_id) === String(sessionId)
        );

    }, [
        terms,
        termId,
        sessionId
    ]);


    /*
    ============================================================
    FETCH FINANCIAL DETAILS
    ============================================================
    */

    const {
        data: details = [],
        isLoading,
        isFetching,
        error,
        refetch
    } = useParentFinancialDetails(
        parentId,
        sessionId,
        termId
    );


    /*
    ============================================================
    PARENT
    ============================================================
    */

    const parent = details[0] || null;


    /*
    ============================================================
    TOTALS
    ============================================================
    */

    const totals = useMemo(() => {

        return details.reduce(
            (acc, child) => {

                acc.currentFees += Number(
                    child.current_term_fees || 0
                );

                acc.previousBalance += Number(
                    child.previous_balance || 0
                );

                acc.paid += Number(
                    child.total_paid || 0
                );

                acc.outstanding += Number(
                    child.outstanding || 0
                );

                return acc;

            },
            {
                currentFees: 0,
                previousBalance: 0,
                paid: 0,
                outstanding: 0
            }
        );

    }, [details]);


    const totalExpected =
        totals.currentFees +
        totals.previousBalance;


    const overallStatus =
        getPaymentStatus(
            totals.outstanding,
            totals.paid
        );


    /*
    ============================================================
    LOADING
    ============================================================
    */

    if (isLoading) {

        return (

            <div className="
                flex
                min-h-[400px]
                items-center
                justify-center
                px-4
            ">

                <div className="text-center">

                    <RefreshCw
                        className="
                            mx-auto
                            mb-3
                            h-7
                            w-7
                            animate-spin
                        "
                    />

                    <p className="
                        text-sm
                        text-muted-foreground
                    ">

                        Loading parent financial details...

                    </p>

                </div>

            </div>

        );

    }


    /*
    ============================================================
    ERROR
    ============================================================
    */

    if (error) {

        return (

            <div className="
                w-full
                p-4
                sm:p-6
            ">

                <Card>

                    <CardContent className="
                        px-4
                        py-10
                        text-center
                        sm:px-6
                    ">

                        <AlertCircle
                            className="
                                mx-auto
                                mb-4
                                h-10
                                w-10
                                text-red-500
                            "
                        />

                        <h2 className="
                            mb-2
                            text-lg
                            font-semibold
                        ">

                            Unable to load financial details

                        </h2>


                        <p className="
                            mx-auto
                            mb-5
                            max-w-lg
                            text-sm
                            text-muted-foreground
                        ">

                            {error?.response?.data?.message ||
                                error?.message ||
                                "Something went wrong while loading this parent's financial information."}

                        </p>


                        <div className="
                            flex
                            flex-col
                            justify-center
                            gap-2
                            sm:flex-row
                            sm:gap-3
                        ">

                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto"
                            >

                                <ArrowLeft className="mr-2 h-4 w-4" />

                                Go Back

                            </Button>


                            <Button
                                onClick={() => refetch()}
                                className="w-full sm:w-auto"
                            >

                                <RefreshCw className="mr-2 h-4 w-4" />

                                Try Again

                            </Button>

                        </div>

                    </CardContent>

                </Card>

            </div>

        );

    }


    /*
    ============================================================
    NO RECORD
    ============================================================
    */

    if (!parent || details.length === 0) {

        return (

            <div className="
                w-full
                p-4
                sm:p-6
            ">

                <Card>

                    <CardContent className="
                        px-4
                        py-10
                        text-center
                        sm:px-6
                    ">

                        <Users
                            className="
                                mx-auto
                                mb-4
                                h-10
                                w-10
                                text-muted-foreground
                            "
                        />

                        <h2 className="
                            mb-2
                            text-lg
                            font-semibold
                        ">

                            No financial records found

                        </h2>


                        <p className="
                            mx-auto
                            mb-5
                            max-w-lg
                            text-sm
                            text-muted-foreground
                        ">

                            No active financial records were found
                            for this parent in the selected academic
                            period.

                        </p>


                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto"
                        >

                            <ArrowLeft className="mr-2 h-4 w-4" />

                            Back to Parent Financial Overview

                        </Button>

                    </CardContent>

                </Card>

            </div>

        );

    }


    /*
    ============================================================
    PAGE
    ============================================================
    */

    return (

        <div className="
            w-full
            space-y-4
            p-4
            sm:space-y-6
            sm:p-6
        ">


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-start
                md:justify-between
            ">

                <div className="min-w-0">

                    <Button
                        variant="ghost"
                        className="
                            mb-2
                            -ml-3
                            px-3
                        "
                        onClick={() => navigate(-1)}
                    >

                        <ArrowLeft className="mr-2 h-4 w-4" />

                        Back

                    </Button>


                    <h1 className="
                        text-xl
                        font-bold
                        sm:text-2xl
                    ">

                        Parent Financial Details

                    </h1>


                    <p className="
                        mt-1
                        max-w-2xl
                        text-sm
                        text-muted-foreground
                    ">

                        Detailed financial information for this
                        parent and their children.

                    </p>

                </div>


                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="
                        w-full
                        md:w-auto
                    "
                >

                    <RefreshCw
                        className={`
                            mr-2
                            h-4
                            w-4
                            ${isFetching ? "animate-spin" : ""}
                        `}
                    />

                    Refresh

                </Button>

            </div>


            {/* =====================================================
                PARENT PROFILE
            ===================================================== */}

            <Card>

                <CardHeader className="
                    p-4
                    sm:p-6
                ">

                    <div className="
                        flex
                        flex-col
                        gap-4
                        md:flex-row
                        md:items-center
                        md:justify-between
                    ">

                        <div className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                            sm:gap-4
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-muted
                                sm:h-14
                                sm:w-14
                            ">

                                <User className="
                                    h-5
                                    w-5
                                    sm:h-7
                                    sm:w-7
                                " />

                            </div>


                            <div className="min-w-0">

                                <CardTitle className="
                                    break-words
                                    text-lg
                                    sm:text-xl
                                ">

                                    {parent.parent_surname}{" "}

                                    {parent.parent_first_name}{" "}

                                    {parent.parent_middle_name || ""}

                                </CardTitle>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-muted-foreground
                                    sm:text-sm
                                ">

                                    Parent ID: {parent.parent_id}

                                </p>

                            </div>

                        </div>


                        <Badge
                            className="w-fit"
                            variant={
                                overallStatus === "OWING"
                                    ? "destructive"
                                    : overallStatus === "PARTLY_PAID"
                                        ? "secondary"
                                        : "default"
                            }
                        >

                            {overallStatus === "PAID"
                                ? "Fully Paid"
                                : overallStatus === "OWING"
                                    ? "Owing"
                                    : "Partly Paid"}

                        </Badge>

                    </div>

                </CardHeader>


                <CardContent className="
                    p-4
                    pt-0
                    sm:p-6
                ">

                    <div className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        md:grid-cols-3
                    ">


                        {/* PHONE */}

                        <div className="
                            flex
                            min-w-0
                            items-start
                            gap-3
                        ">

                            <Phone className="
                                mt-0.5
                                h-5
                                w-5
                                shrink-0
                                text-muted-foreground
                            " />

                            <div className="min-w-0">

                                <p className="
                                    text-xs
                                    text-muted-foreground
                                ">

                                    Phone Number

                                </p>

                                <p className="
                                    break-words
                                    text-sm
                                    font-medium
                                ">

                                    {parent.phone_number ||
                                        "Not provided"}

                                </p>

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div className="
                            flex
                            min-w-0
                            items-start
                            gap-3
                        ">

                            <Mail className="
                                mt-0.5
                                h-5
                                w-5
                                shrink-0
                                text-muted-foreground
                            " />

                            <div className="min-w-0">

                                <p className="
                                    text-xs
                                    text-muted-foreground
                                ">

                                    Email

                                </p>

                                <p className="
                                    break-all
                                    text-sm
                                    font-medium
                                ">

                                    {parent.email ||
                                        "Not provided"}

                                </p>

                            </div>

                        </div>


                        {/* CHILDREN */}

                        <div className="
                            flex
                            items-start
                            gap-3
                        ">

                            <Users className="
                                mt-0.5
                                h-5
                                w-5
                                shrink-0
                                text-muted-foreground
                            " />

                            <div>

                                <p className="
                                    text-xs
                                    text-muted-foreground
                                ">

                                    Children

                                </p>

                                <p className="
                                    text-sm
                                    font-medium
                                ">

                                    {details.length}

                                </p>

                            </div>

                        </div>

                    </div>

                </CardContent>

            </Card>


            {/* =====================================================
                FINANCIAL PERIOD
            ===================================================== */}

            <Card>

                <CardContent className="
                    flex
                    flex-col
                    gap-3
                    p-4
                    sm:p-6
                    md:flex-row
                    md:items-center
                    md:justify-between
                ">

                    <div className="min-w-0">

                        <p className="
                            text-sm
                            text-muted-foreground
                        ">

                            Financial Period

                        </p>


                        <p className="
                            break-words
                            text-sm
                            font-semibold
                            sm:text-base
                        ">

                            {selectedTerm
                                ? `${selectedTerm.session_name} — ${selectedTerm.term_name}`
                                : "Loading financial period..."}

                        </p>

                    </div>


                    <Badge
                        variant="outline"
                        className="w-fit shrink-0"
                    >

                        {selectedTerm?.is_current
                            ? "Current Financial Period"
                            : "Selected Financial Period"}

                    </Badge>

                </CardContent>

            </Card>


            {/* =====================================================
                SUMMARY CARDS
            ===================================================== */}

            <div className="
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-4
            ">


                {/* CURRENT TERM */}

                <Card>

                    <CardHeader className="
                        flex
                        flex-row
                        items-center
                        justify-between
                        p-4
                        pb-2
                        sm:p-6
                        sm:pb-2
                    ">

                        <CardTitle className="
                            text-xs
                            font-medium
                            sm:text-sm
                        ">

                            Current Term Fees

                        </CardTitle>

                        <Wallet className="
                            h-4
                            w-4
                            sm:h-5
                            sm:w-5
                        " />

                    </CardHeader>


                    <CardContent className="
                        p-4
                        pt-0
                        sm:p-6
                        sm:pt-0
                    ">

                        <p className="
                            text-xl
                            font-bold
                            sm:text-2xl
                        ">

                            {formatCurrency(
                                totals.currentFees
                            )}

                        </p>


                        <p className="
                            mt-1
                            text-xs
                            text-muted-foreground
                        ">

                            Fees assigned for this term

                        </p>

                    </CardContent>

                </Card>


                {/* PREVIOUS BALANCE */}

                <Card>

                    <CardHeader className="
                        flex
                        flex-row
                        items-center
                        justify-between
                        p-4
                        pb-2
                        sm:p-6
                        sm:pb-2
                    ">

                        <CardTitle className="
                            text-xs
                            font-medium
                            sm:text-sm
                        ">

                            Previous Balance

                        </CardTitle>


                        <AlertCircle className="
                            h-4
                            w-4
                            sm:h-5
                            sm:w-5
                        " />

                    </CardHeader>


                    <CardContent className="
                        p-4
                        pt-0
                        sm:p-6
                        sm:pt-0
                    ">

                        <p className="
                            text-xl
                            font-bold
                            sm:text-2xl
                        ">

                            {formatCurrency(
                                totals.previousBalance
                            )}

                        </p>


                        <p className="
                            mt-1
                            text-xs
                            text-muted-foreground
                        ">

                            Outstanding from previous term

                        </p>

                    </CardContent>

                </Card>


                {/* PAID */}

                <Card>

                    <CardHeader className="
                        flex
                        flex-row
                        items-center
                        justify-between
                        p-4
                        pb-2
                        sm:p-6
                        sm:pb-2
                    ">

                        <CardTitle className="
                            text-xs
                            font-medium
                            sm:text-sm
                        ">

                            Total Paid

                        </CardTitle>


                        <CreditCard className="
                            h-4
                            w-4
                            sm:h-5
                            sm:w-5
                        " />

                    </CardHeader>


                    <CardContent className="
                        p-4
                        pt-0
                        sm:p-6
                        sm:pt-0
                    ">

                        <p className="
                            text-xl
                            font-bold
                            sm:text-2xl
                        ">

                            {formatCurrency(
                                totals.paid
                            )}

                        </p>


                        <p className="
                            mt-1
                            text-xs
                            text-muted-foreground
                        ">

                            Payments received this term

                        </p>

                    </CardContent>

                </Card>


                {/* OUTSTANDING */}

                <Card>

                    <CardHeader className="
                        flex
                        flex-row
                        items-center
                        justify-between
                        p-4
                        pb-2
                        sm:p-6
                        sm:pb-2
                    ">

                        <CardTitle className="
                            text-xs
                            font-medium
                            sm:text-sm
                        ">

                            Outstanding

                        </CardTitle>


                        <Receipt className="
                            h-4
                            w-4
                            sm:h-5
                            sm:w-5
                        " />

                    </CardHeader>


                    <CardContent className="
                        p-4
                        pt-0
                        sm:p-6
                        sm:pt-0
                    ">

                        <p className="
                            text-xl
                            font-bold
                            sm:text-2xl
                        ">

                            {formatCurrency(
                                totals.outstanding
                            )}

                        </p>


                        <p className="
                            mt-1
                            text-xs
                            text-muted-foreground
                        ">

                            Amount still owed

                        </p>

                    </CardContent>

                </Card>

            </div>


            {/* =====================================================
                EXPECTED SUMMARY
            ===================================================== */}

            <Card>

                <CardContent className="
                    p-4
                    sm:p-6
                ">

                    <div className="
                        flex
                        flex-col
                        gap-5
                        sm:gap-6
                        md:flex-row
                        md:items-center
                        md:justify-between
                    ">

                        <div>

                            <p className="
                                text-sm
                                text-muted-foreground
                            ">

                                Total Financial Obligation

                            </p>


                            <p className="
                                text-xl
                                font-bold
                                sm:text-2xl
                            ">

                                {formatCurrency(
                                    totalExpected
                                )}

                            </p>


                            <p className="
                                text-xs
                                text-muted-foreground
                            ">

                                Current term fees + previous balance

                            </p>

                        </div>


                        <div className="
                            border-t
                            pt-4
                            md:border-0
                            md:pt-0
                            md:text-right
                        ">

                            <p className="
                                text-sm
                                text-muted-foreground
                            ">

                                Payment Coverage

                            </p>


                            <p className="
                                text-xl
                                font-bold
                                sm:text-2xl
                            ">

                                {totalExpected > 0
                                    ? `${Math.min(
                                        (
                                            totals.paid /
                                            totalExpected
                                        ) * 100,
                                        100
                                    ).toFixed(1)}%`
                                    : "0%"}

                            </p>

                        </div>

                    </div>

                </CardContent>

            </Card>


            {/* =====================================================
                CHILDREN
            ===================================================== */}

            <Card>

                <CardHeader className="
                    p-4
                    sm:p-6
                ">

                    <CardTitle className="text-base sm:text-lg">

                        Children Financial Records

                    </CardTitle>

                </CardHeader>


                <CardContent className="
                    p-4
                    pt-0
                    sm:p-6
                ">

                    <div className="space-y-4 sm:space-y-5">


                        {details.map((child) => {

                            const currentFees =
                                Number(
                                    child.current_term_fees || 0
                                );


                            const previousBalance =
                                Number(
                                    child.previous_balance || 0
                                );


                            const paid =
                                Number(
                                    child.total_paid || 0
                                );


                            const outstanding =
                                Number(
                                    child.outstanding || 0
                                );


                            const expected =
                                currentFees +
                                previousBalance;


                            const status =
                                getPaymentStatus(
                                    outstanding,
                                    paid
                                );


                            const progress =
                                expected > 0
                                    ? Math.min(
                                        (
                                            paid /
                                            expected
                                        ) * 100,
                                        100
                                    )
                                    : 0;


                            return (

                                <Card
                                    key={child.student_id}
                                    className="overflow-hidden"
                                >

                                    {/* CHILD HEADER */}

                                    <CardHeader className="
                                        bg-muted/30
                                        p-4
                                        sm:p-6
                                    ">

                                        <div className="
                                            flex
                                            flex-col
                                            gap-3
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        ">

                                            <div className="
                                                flex
                                                min-w-0
                                                items-start
                                                gap-3
                                            ">

                                                <div className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-background
                                                ">

                                                    <GraduationCap className="
                                                        h-5
                                                        w-5
                                                    " />

                                                </div>


                                                <div className="min-w-0">

                                                    <CardTitle className="
                                                        break-words
                                                        text-sm
                                                        sm:text-base
                                                    ">

                                                        {
                                                            child.student_surname
                                                        }{" "}

                                                        {
                                                            child.student_first_name
                                                        }{" "}

                                                        {
                                                            child.student_middle_name ||
                                                            ""
                                                        }

                                                    </CardTitle>


                                                    <p className="
                                                        mt-1
                                                        break-all
                                                        text-xs
                                                        text-muted-foreground
                                                    ">

                                                        Admission No:{" "}

                                                        {
                                                            child.admission_number ||
                                                            "N/A"
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            <Badge
                                                className="w-fit"
                                                variant={
                                                    status === "OWING"
                                                        ? "destructive"
                                                        : status === "PARTLY_PAID"
                                                            ? "secondary"
                                                            : "default"
                                                }
                                            >

                                                {status === "PAID"
                                                    ? "Fully Paid"
                                                    : status === "OWING"
                                                        ? "Owing"
                                                        : "Partly Paid"}

                                            </Badge>

                                        </div>

                                    </CardHeader>


                                    <CardContent className="
                                        p-4
                                        sm:p-6
                                    ">


                                        {/* CLASS / ARM */}

                                        <div className="
                                            mb-5
                                            flex
                                            flex-wrap
                                            gap-2
                                        ">

                                            {child.class_name && (

                                                <Badge
                                                    variant="outline"
                                                    className="max-w-full"
                                                >

                                                    <Building2 className="
                                                        mr-1
                                                        h-3.5
                                                        w-3.5
                                                        shrink-0
                                                    " />

                                                    <span className="truncate">

                                                        {child.class_name}

                                                    </span>

                                                </Badge>

                                            )}


                                            {child.arm_name && (

                                                <Badge
                                                    variant="outline"
                                                    className="max-w-full"
                                                >

                                                    <span className="truncate">

                                                        {child.arm_name}

                                                    </span>

                                                </Badge>

                                            )}

                                        </div>


                                        {/* FINANCIAL GRID */}

                                        <div className="
                                            grid
                                            gap-4
                                            grid-cols-2
                                            sm:grid-cols-2
                                            lg:grid-cols-5
                                        ">


                                            <div>

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Current Term Fees

                                                </p>


                                                <p className="
                                                    mt-1
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                ">

                                                    {formatCurrency(
                                                        currentFees
                                                    )}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Previous Balance

                                                </p>


                                                <p className="
                                                    mt-1
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                ">

                                                    {formatCurrency(
                                                        previousBalance
                                                    )}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Total Expected

                                                </p>


                                                <p className="
                                                    mt-1
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                ">

                                                    {formatCurrency(
                                                        expected
                                                    )}

                                                </p>

                                            </div>


                                            <div>

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Paid

                                                </p>


                                                <p className="
                                                    mt-1
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                ">

                                                    {formatCurrency(
                                                        paid
                                                    )}

                                                </p>

                                            </div>


                                            <div className="
                                                col-span-2
                                                sm:col-span-1
                                            ">

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Outstanding

                                                </p>


                                                <p className="
                                                    mt-1
                                                    break-words
                                                    text-sm
                                                    font-semibold
                                                ">

                                                    {formatCurrency(
                                                        outstanding
                                                    )}

                                                </p>

                                            </div>

                                        </div>


                                        {/* PAYMENT PROGRESS */}

                                        <div className="mt-6">

                                            <div className="
                                                mb-2
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                            ">

                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">

                                                    Payment Progress

                                                </p>


                                                <p className="
                                                    shrink-0
                                                    text-xs
                                                    font-medium
                                                ">

                                                    {expected > 0
                                                        ? `${progress.toFixed(1)}%`
                                                        : "0%"}

                                                </p>

                                            </div>


                                            <div className="
                                                h-2
                                                w-full
                                                overflow-hidden
                                                rounded-full
                                                bg-muted
                                            ">

                                                <div

                                                    className="
                                                        h-full
                                                        rounded-full
                                                        bg-primary
                                                        transition-all
                                                    "

                                                    style={{
                                                        width:
                                                            `${progress}%`
                                                    }}

                                                />

                                            </div>

                                        </div>

                                    </CardContent>

                                </Card>

                            );

                        })}

                    </div>

                </CardContent>

            </Card>


            {/* =====================================================
                BACK BUTTON
            ===================================================== */}

            <div className="pb-2">

                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="
                        w-full
                        sm:w-auto
                    "
                >

                    <ArrowLeft className="mr-2 h-4 w-4" />

                    Back to Parent Financial Overview

                </Button>

            </div>

        </div>

    );

}


export default ParentFinancialDetailsPage;

// import { useMemo } from "react";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";

// import {
//     ArrowLeft,
//     User,
//     Users,
//     Phone,
//     Mail,
//     GraduationCap,
//     Wallet,
//     CreditCard,
//     AlertCircle,
//     RefreshCw,
//     Receipt,
//     Building2
// } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle
// } from "@/components/ui/card";

// import { Badge } from "@/components/ui/badge";

// import { useParentFinancialDetails } from "@/hooks/useParentFinancialDetails";
// import { useTerms } from "@/hooks/useTerms";


// const formatCurrency = (amount) => {

//     return `₦${Number(amount || 0).toLocaleString(
//         "en-NG",
//         {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         }
//     )}`;

// };


// const getPaymentStatus = (
//     outstanding,
//     paid
// ) => {

//     outstanding = Number(outstanding || 0);

//     paid = Number(paid || 0);


//     if (outstanding <= 0) {

//         return "PAID";

//     }


//     if (paid <= 0) {

//         return "OWING";

//     }


//     return "PARTLY_PAID";

// };


// function ParentFinancialDetailsPage() {

//     const navigate = useNavigate();

//     const {
//         parentId
//     } = useParams();


//     /*
//     |--------------------------------------------------------------------------
//     | SESSION / TERM
//     |--------------------------------------------------------------------------
//     |
//     | The overview page will pass these through the URL.
//     |
//     | Example:
//     |
//     | /admin/parents/financial/5?sessionId=1&termId=1
//     |
//     | This removes the need to hardcode them inside this page.
//     |
//     */

//     const [searchParams] =
//         useSearchParams();


//     const sessionId =
//         searchParams.get("sessionId");


//     const termId =
//         searchParams.get("termId");

//     const {
//         data: terms = []
//     } = useTerms();

//     const selectedTerm =
//         useMemo(() => {

//             return terms.find(
//                 (term) =>
//                     String(term.id) === String(termId) &&
//                     String(term.session_id) === String(sessionId)
//             );

//         }, [
//             terms,
//             termId,
//             sessionId
//     ]);


//     /*
//     |--------------------------------------------------------------------------
//     | FETCH FINANCIAL DETAILS
//     |--------------------------------------------------------------------------
//     */

//     const {
//         data: details = [],
//         isLoading,
//         isFetching,
//         error,
//         refetch
//     } = useParentFinancialDetails(
//         parentId,
//         sessionId,
//         termId
//     );


//     /*
//     |--------------------------------------------------------------------------
//     | PARENT INFORMATION
//     |--------------------------------------------------------------------------
//     */

//     const parent = details[0] || null;


//     /*
//     |--------------------------------------------------------------------------
//     | FINANCIAL TOTALS
//     |--------------------------------------------------------------------------
//     */

//     const totals = useMemo(() => {

//         return details.reduce(
//             (acc, child) => {

//                 acc.currentFees += Number(
//                     child.current_term_fees || 0
//                 );


//                 acc.previousBalance += Number(
//                     child.previous_balance || 0
//                 );


//                 acc.paid += Number(
//                     child.total_paid || 0
//                 );


//                 acc.outstanding += Number(
//                     child.outstanding || 0
//                 );


//                 return acc;

//             },
//             {
//                 currentFees: 0,
//                 previousBalance: 0,
//                 paid: 0,
//                 outstanding: 0
//             }
//         );

//     }, [details]);


//     const totalExpected =
//         totals.currentFees +
//         totals.previousBalance;


//     /*
//     |--------------------------------------------------------------------------
//     | OVERALL STATUS
//     |--------------------------------------------------------------------------
//     */

//     const overallStatus =
//         getPaymentStatus(
//             totals.outstanding,
//             totals.paid
//         );


//     /*
//     |--------------------------------------------------------------------------
//     | LOADING
//     |--------------------------------------------------------------------------
//     */

//     if (isLoading) {

//         return (

//             <div className="flex min-h-[400px] items-center justify-center">

//                 <div className="text-center">

//                     <RefreshCw
//                         className="mx-auto mb-3 h-7 w-7 animate-spin"
//                     />

//                     <p className="text-muted-foreground">

//                         Loading parent financial details...

//                     </p>

//                 </div>

//             </div>

//         );

//     }


//     /*
//     |--------------------------------------------------------------------------
//     | ERROR
//     |--------------------------------------------------------------------------
//     */

//     if (error) {

//         return (

//             <div className="p-6">

//                 <Card>

//                     <CardContent className="py-10 text-center">

//                         <AlertCircle
//                             className="mx-auto mb-4 h-10 w-10 text-red-500"
//                         />

//                         <h2 className="mb-2 text-lg font-semibold">

//                             Unable to load financial details

//                         </h2>


//                         <p className="mb-5 text-sm text-muted-foreground">

//                             {error?.response?.data?.message ||
//                                 error?.message ||
//                                 "Something went wrong while loading this parent's financial information."}

//                         </p>


//                         <div className="flex justify-center gap-3">

//                             <Button
//                                 variant="outline"
//                                 onClick={() => navigate(-1)}
//                             >

//                                 <ArrowLeft className="mr-2 h-4 w-4" />

//                                 Go Back

//                             </Button>


//                             <Button
//                                 onClick={() => refetch()}
//                             >

//                                 <RefreshCw className="mr-2 h-4 w-4" />

//                                 Try Again

//                             </Button>

//                         </div>

//                     </CardContent>

//                 </Card>

//             </div>

//         );

//     }


//     /*
//     |--------------------------------------------------------------------------
//     | NO RECORD
//     |--------------------------------------------------------------------------
//     */

//     if (!parent || details.length === 0) {

//         return (

//             <div className="p-6">

//                 <Card>

//                     <CardContent className="py-10 text-center">

//                         <Users
//                             className="mx-auto mb-4 h-10 w-10 text-muted-foreground"
//                         />

//                         <h2 className="mb-2 text-lg font-semibold">

//                             No financial records found

//                         </h2>


//                         <p className="mb-5 text-sm text-muted-foreground">

//                             No active financial records were found for this
//                             parent in the selected academic period.

//                         </p>


//                         <Button
//                             variant="outline"
//                             onClick={() => navigate(-1)}
//                         >

//                             <ArrowLeft className="mr-2 h-4 w-4" />

//                             Back to Parent Financial Overview

//                         </Button>

//                     </CardContent>

//                 </Card>

//             </div>

//         );

//     }


//     /*
//     |--------------------------------------------------------------------------
//     | PAGE
//     |--------------------------------------------------------------------------
//     */

//     return (

//         <div className="space-y-6 p-6">


//             {/* =========================================================
//                 PAGE HEADER
//             ========================================================= */}

//             <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

//                 <div>

//                     <Button
//                         variant="ghost"
//                         className="mb-3 -ml-3"
//                         onClick={() => navigate(-1)}
//                     >

//                         <ArrowLeft className="mr-2 h-4 w-4" />

//                         Back

//                     </Button>


//                     <h1 className="text-2xl font-bold">

//                         Parent Financial Details

//                     </h1>


//                     <p className="text-muted-foreground">

//                         Detailed financial information for this parent
//                         and their children.

//                     </p>

//                 </div>


//                 <Button
//                     variant="outline"
//                     onClick={() => refetch()}
//                     disabled={isFetching}
//                 >

//                     <RefreshCw
//                         className={`mr-2 h-4 w-4 ${
//                             isFetching
//                                 ? "animate-spin"
//                                 : ""
//                         }`}
//                     />

//                     Refresh

//                 </Button>

//             </div>


//             {/* =========================================================
//                 PARENT PROFILE
//             ========================================================= */}

//             <Card>

//                 <CardHeader>

//                     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//                         <div className="flex items-center gap-4">

//                             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">

//                                 <User className="h-7 w-7" />

//                             </div>


//                             <div>

//                                 <CardTitle className="text-xl">

//                                     {parent.parent_surname}{" "}

//                                     {parent.parent_first_name}{" "}

//                                     {parent.parent_middle_name || ""}

//                                 </CardTitle>


//                                 <p className="mt-1 text-sm text-muted-foreground">

//                                     Parent ID: {parent.parent_id}

//                                 </p>

//                             </div>

//                         </div>


//                         <Badge
//                             variant={
//                                 overallStatus === "OWING"
//                                     ? "destructive"
//                                     : overallStatus === "PARTLY_PAID"
//                                         ? "secondary"
//                                         : "default"
//                             }
//                         >

//                             {overallStatus === "PAID"
//                                 ? "Fully Paid"
//                                 : overallStatus === "OWING"
//                                     ? "Owing"
//                                     : "Partly Paid"}

//                         </Badge>

//                     </div>

//                 </CardHeader>


//                 <CardContent>

//                     <div className="grid gap-4 md:grid-cols-3">


//                         {/* PHONE */}

//                         <div className="flex items-start gap-3">

//                             <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />

//                             <div>

//                                 <p className="text-xs text-muted-foreground">

//                                     Phone Number

//                                 </p>

//                                 <p className="font-medium">

//                                     {parent.phone_number || "Not provided"}

//                                 </p>

//                             </div>

//                         </div>


//                         {/* EMAIL */}

//                         <div className="flex items-start gap-3">

//                             <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />

//                             <div>

//                                 <p className="text-xs text-muted-foreground">

//                                     Email

//                                 </p>

//                                 <p className="font-medium break-all">

//                                     {parent.email || "Not provided"}

//                                 </p>

//                             </div>

//                         </div>


//                         {/* CHILDREN */}

//                         <div className="flex items-start gap-3">

//                             <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />

//                             <div>

//                                 <p className="text-xs text-muted-foreground">

//                                     Children

//                                 </p>

//                                 <p className="font-medium">

//                                     {details.length}

//                                 </p>

//                             </div>

//                         </div>

//                     </div>

//                 </CardContent>

//             </Card>


//             {/* =========================================================
//                 FINANCIAL PERIOD
//             ========================================================= */}

//             <Card>

//                 <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">

//                     <div>

//                         <p className="text-sm text-muted-foreground">

//                             Financial Period

//                         </p>


//                         <p className="font-semibold">

//                             {selectedTerm
//                                 ? `${selectedTerm.session_name} — ${selectedTerm.term_name}`
//                                 : "Loading financial period..."}

//                         </p>

//                     </div>


//                     <Badge variant="outline">

//                         {selectedTerm?.is_current
//                             ? "Current Financial Period"
//                             : "Selected Financial Period"}

//                     </Badge>

//                 </CardContent>

//             </Card>


//             {/* =========================================================
//                 SUMMARY CARDS
//             ========================================================= */}

//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


//                 {/* CURRENT TERM FEES */}

//                 <Card>

//                     <CardHeader className="flex flex-row items-center justify-between pb-2">

//                         <CardTitle className="text-sm font-medium">

//                             Current Term Fees

//                         </CardTitle>


//                         <Wallet className="h-5 w-5" />

//                     </CardHeader>


//                     <CardContent>

//                         <p className="text-2xl font-bold">

//                             {formatCurrency(
//                                 totals.currentFees
//                             )}

//                         </p>


//                         <p className="mt-1 text-xs text-muted-foreground">

//                             Fees assigned for this term

//                         </p>

//                     </CardContent>

//                 </Card>


//                 {/* PREVIOUS BALANCE */}

//                 <Card>

//                     <CardHeader className="flex flex-row items-center justify-between pb-2">

//                         <CardTitle className="text-sm font-medium">

//                             Previous Balance

//                         </CardTitle>


//                         <AlertCircle className="h-5 w-5" />

//                     </CardHeader>


//                     <CardContent>

//                         <p className="text-2xl font-bold">

//                             {formatCurrency(
//                                 totals.previousBalance
//                             )}

//                         </p>


//                         <p className="mt-1 text-xs text-muted-foreground">

//                             Outstanding from previous term

//                         </p>

//                     </CardContent>

//                 </Card>


//                 {/* TOTAL PAID */}

//                 <Card>

//                     <CardHeader className="flex flex-row items-center justify-between pb-2">

//                         <CardTitle className="text-sm font-medium">

//                             Total Paid

//                         </CardTitle>


//                         <CreditCard className="h-5 w-5" />

//                     </CardHeader>


//                     <CardContent>

//                         <p className="text-2xl font-bold">

//                             {formatCurrency(
//                                 totals.paid
//                             )}

//                         </p>


//                         <p className="mt-1 text-xs text-muted-foreground">

//                             Payments received this term

//                         </p>

//                     </CardContent>

//                 </Card>


//                 {/* OUTSTANDING */}

//                 <Card>

//                     <CardHeader className="flex flex-row items-center justify-between pb-2">

//                         <CardTitle className="text-sm font-medium">

//                             Outstanding

//                         </CardTitle>


//                         <Receipt className="h-5 w-5" />

//                     </CardHeader>


//                     <CardContent>

//                         <p className="text-2xl font-bold">

//                             {formatCurrency(
//                                 totals.outstanding
//                             )}

//                         </p>


//                         <p className="mt-1 text-xs text-muted-foreground">

//                             Amount still owed

//                         </p>

//                     </CardContent>

//                 </Card>

//             </div>


//             {/* =========================================================
//                 EXPECTED SUMMARY
//             ========================================================= */}

//             <Card>

//                 <CardContent className="pt-6">

//                     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//                         <div>

//                             <p className="text-sm text-muted-foreground">

//                                 Total Financial Obligation

//                             </p>


//                             <p className="text-2xl font-bold">

//                                 {formatCurrency(
//                                     totalExpected
//                                 )}

//                             </p>


//                             <p className="text-xs text-muted-foreground">

//                                 Current term fees + previous balance

//                             </p>

//                         </div>


//                         <div className="text-left md:text-right">

//                             <p className="text-sm text-muted-foreground">

//                                 Payment Coverage

//                             </p>


//                             <p className="text-2xl font-bold">

//                                 {totalExpected > 0
//                                     ? `${Math.min(
//                                         (
//                                             totals.paid /
//                                             totalExpected
//                                         ) * 100,
//                                         100
//                                     ).toFixed(1)}%`
//                                     : "0%"}

//                             </p>

//                         </div>

//                     </div>

//                 </CardContent>

//             </Card>


//             {/* =========================================================
//                 CHILDREN FINANCIAL RECORDS
//             ========================================================= */}

//             <Card>

//                 <CardHeader>

//                     <CardTitle>

//                         Children Financial Records

//                     </CardTitle>

//                 </CardHeader>


//                 <CardContent>

//                     <div className="space-y-5">


//                         {details.map(
//                             (child) => {

//                                 const currentFees =
//                                     Number(
//                                         child.current_term_fees || 0
//                                     );


//                                 const previousBalance =
//                                     Number(
//                                         child.previous_balance || 0
//                                     );


//                                 const paid =
//                                     Number(
//                                         child.total_paid || 0
//                                     );


//                                 const outstanding =
//                                     Number(
//                                         child.outstanding || 0
//                                     );


//                                 const expected =
//                                     currentFees +
//                                     previousBalance;


//                                 const status =
//                                     getPaymentStatus(
//                                         outstanding,
//                                         paid
//                                     );


//                                 return (

//                                     <Card
//                                         key={
//                                             child.student_id
//                                         }
//                                         className="overflow-hidden"
//                                     >

//                                         <CardHeader className="bg-muted/30">

//                                             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//                                                 <div className="flex items-start gap-3">

//                                                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">

//                                                         <GraduationCap className="h-5 w-5" />

//                                                     </div>


//                                                     <div>

//                                                         <CardTitle className="text-base">

//                                                             {
//                                                                 child.student_surname
//                                                             }{" "}

//                                                             {
//                                                                 child.student_first_name
//                                                             }{" "}

//                                                             {
//                                                                 child.student_middle_name ||
//                                                                 ""
//                                                             }

//                                                         </CardTitle>


//                                                         <p className="text-xs text-muted-foreground">

//                                                             Admission No:{" "}

//                                                             {
//                                                                 child.admission_number ||
//                                                                 "N/A"
//                                                             }

//                                                         </p>

//                                                     </div>

//                                                 </div>


//                                                 <Badge
//                                                     variant={
//                                                         status === "OWING"
//                                                             ? "destructive"
//                                                             : status === "PARTLY_PAID"
//                                                                 ? "secondary"
//                                                                 : "default"
//                                                     }
//                                                 >

//                                                     {status === "PAID"
//                                                         ? "Fully Paid"
//                                                         : status === "OWING"
//                                                             ? "Owing"
//                                                             : "Partly Paid"}

//                                                 </Badge>

//                                             </div>

//                                         </CardHeader>


//                                         <CardContent className="pt-6">


//                                             {/* CLASS */}

//                                             <div className="mb-5 flex flex-wrap gap-3">

//                                                 {child.class_name && (

//                                                     <Badge variant="outline">

//                                                         <Building2 className="mr-1 h-3.5 w-3.5" />

//                                                         {child.class_name}

//                                                     </Badge>

//                                                 )}


//                                                 {child.arm_name && (

//                                                     <Badge variant="outline">

//                                                         {child.arm_name}

//                                                     </Badge>

//                                                 )}

//                                             </div>


//                                             {/* FINANCIAL GRID */}

//                                             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">


//                                                 <div>

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Current Term Fees

//                                                     </p>


//                                                     <p className="mt-1 font-semibold">

//                                                         {formatCurrency(
//                                                             currentFees
//                                                         )}

//                                                     </p>

//                                                 </div>


//                                                 <div>

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Previous Balance

//                                                     </p>


//                                                     <p className="mt-1 font-semibold">

//                                                         {formatCurrency(
//                                                             previousBalance
//                                                         )}

//                                                     </p>

//                                                 </div>


//                                                 <div>

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Total Expected

//                                                     </p>


//                                                     <p className="mt-1 font-semibold">

//                                                         {formatCurrency(
//                                                             expected
//                                                         )}

//                                                     </p>

//                                                 </div>


//                                                 <div>

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Paid

//                                                     </p>


//                                                     <p className="mt-1 font-semibold">

//                                                         {formatCurrency(
//                                                             paid
//                                                         )}

//                                                     </p>

//                                                 </div>


//                                                 <div>

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Outstanding

//                                                     </p>


//                                                     <p className="mt-1 font-semibold">

//                                                         {formatCurrency(
//                                                             outstanding
//                                                         )}

//                                                     </p>

//                                                 </div>

//                                             </div>


//                                             {/* PAYMENT PROGRESS */}

//                                             <div className="mt-6">

//                                                 <div className="mb-2 flex items-center justify-between">

//                                                     <p className="text-xs text-muted-foreground">

//                                                         Payment Progress

//                                                     </p>


//                                                     <p className="text-xs font-medium">

//                                                         {expected > 0
//                                                             ? `${Math.min(
//                                                                 (
//                                                                     paid /
//                                                                     expected
//                                                                 ) * 100,
//                                                                 100
//                                                             ).toFixed(1)}%`
//                                                             : "0%"}

//                                                     </p>

//                                                 </div>


//                                                 <div className="h-2 w-full overflow-hidden rounded-full bg-muted">

//                                                     <div

//                                                         className="h-full rounded-full bg-primary transition-all"

//                                                         style={{
//                                                             width:
//                                                                 expected > 0
//                                                                     ? `${Math.min(
//                                                                         (
//                                                                             paid /
//                                                                             expected
//                                                                         ) * 100,
//                                                                         100
//                                                                     )}%`
//                                                                     : "0%"
//                                                         }}

//                                                     />

//                                                 </div>

//                                             </div>

//                                         </CardContent>

//                                     </Card>

//                                 );

//                             }
//                         )}

//                     </div>

//                 </CardContent>

//             </Card>


//             {/* =========================================================
//                 BACK BUTTON
//             ========================================================= */}

//             <div className="flex justify-start">

//                 <Button
//                     variant="outline"
//                     onClick={() => navigate(-1)}
//                 >

//                     <ArrowLeft className="mr-2 h-4 w-4" />

//                     Back to Parent Financial Overview

//                 </Button>

//             </div>

//         </div>

//     );

// }


// export default ParentFinancialDetailsPage;