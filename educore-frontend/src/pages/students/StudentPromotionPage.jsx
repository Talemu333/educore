import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ArrowRight,
    CheckCircle,
    GraduationCap,
    History,
    Loader2,
    RefreshCw,
    Users,
    UserCheck,
    UserX
} from "lucide-react";

import { usePromotionSetup } from "@/hooks/usePromotionSetup";
import { usePromotionStudents } from "@/hooks/usePromotionStudents";
import { usePromotionArms } from "@/hooks/usePromotionArms";
import { usePromoteStudents } from "@/hooks/usePromoteStudents";


function StudentPromotionPage() {

    /*
    ============================================================
    DATA
    ============================================================
    */

    const {
        data: setup,
        isLoading: setupLoading,
        isError: setupError
    } = usePromotionSetup();


    /*
    ============================================================
    STATE
    ============================================================
    */

    const [currentClassId, setCurrentClassId] = useState("");
    const [currentArmId, setCurrentArmId] = useState("");

    const [destinationArmId, setDestinationArmId] = useState("");

    const [selectedStudents, setSelectedStudents] = useState([]);

    const [studentActions, setStudentActions] = useState({});

    const [lastProcessed, setLastProcessed] = useState(null);


    /*
    ============================================================
    CURRENT CLASS
    ============================================================
    */

    const currentClass = useMemo(() => {

        if (!setup?.classes) {
            return null;
        }

        return setup.classes.find(
            cls =>
                String(cls.id) === String(currentClassId)
        );

    }, [setup, currentClassId]);


    /*
    ============================================================
    CLASS PROGRESSION
    ============================================================
    */

    const classProgression = useMemo(() => {

        if (!setup?.classes?.length) {
            return [];
        }

        /*
         * We deliberately use the actual order supplied
         * by the promotion setup API.
         *
         * Expected progression:
         *
         * JSS1 → JSS2 → JSS3 → SS1 → SS2 → SS3
         */

        return [...setup.classes];

    }, [setup]);


    /*
    ============================================================
    SS3
    ============================================================
    */

    const isSS3 = useMemo(() => {

        if (!currentClass) {
            return false;
        }

        const className =
            String(currentClass.class_name || "")
                .trim()
                .toUpperCase();

        const classLevel =
            String(currentClass.class_level || "")
                .trim()
                .toUpperCase();

        return (
            className === "SS3" ||
            classLevel === "SS3"
        );

    }, [currentClass]);


    /*
    ============================================================
    DESTINATION CLASS
    ============================================================
    */

    const destinationClass = useMemo(() => {

        if (
            !currentClassId ||
            isSS3 ||
            !classProgression.length
        ) {
            return null;
        }

        const currentIndex =
            classProgression.findIndex(
                cls =>
                    String(cls.id) ===
                    String(currentClassId)
            );

        if (
            currentIndex === -1 ||
            currentIndex >= classProgression.length - 1
        ) {
            return null;
        }

        return classProgression[currentIndex + 1];

    }, [
        currentClassId,
        isSS3,
        classProgression
    ]);


    const destinationClassId =
        destinationClass
            ? String(destinationClass.id)
            : "";


    /*
    ============================================================
    CURRENT ARMS
    ============================================================
    */

    const {
        data: currentArms = [],
        isLoading: currentArmsLoading
    } = usePromotionArms(currentClassId);


    /*
    ============================================================
    STUDENTS
    ============================================================
    */

    const {
        data: students = [],
        isLoading: studentsLoading,
        isError: studentsError,
        refetch: refetchStudents
    } = usePromotionStudents({

        classId:
            currentClassId
                ? Number(currentClassId)
                : null,

        armId:
            currentArmId
                ? Number(currentArmId)
                : null

    });


    /*
    ============================================================
    DESTINATION ARMS
    ============================================================
    */

    const {
        data: destinationArms = [],
        isLoading: destinationArmsLoading
    } = usePromotionArms(destinationClassId);


    /*
    ============================================================
    MUTATION
    ============================================================
    */

    const {
        mutate: promote,
        isPending: promoting
    } = usePromoteStudents();


    /*
    ============================================================
    RESET CURRENT ARM
    ============================================================
    */

    useEffect(() => {

        setCurrentArmId("");

    }, [currentClassId]);


    /*
    ============================================================
    RESET DESTINATION ARM
    ============================================================
    */

    useEffect(() => {

        setDestinationArmId("");

    }, [destinationClassId]);


    /*
    ============================================================
    RESET SELECTION
    ============================================================
    */

    useEffect(() => {

        setSelectedStudents([]);
        setStudentActions({});
        setLastProcessed(null);

    }, [
        currentClassId,
        currentArmId
    ]);


    /*
    ============================================================
    STUDENT ACTION
    ============================================================
    */

    const getStudentAction = studentId => {

        return (
            studentActions[studentId] ||
            (
                isSS3
                    ? "Graduated"
                    : "Promoted"
            )
        );

    };


    /*
    ============================================================
    CHANGE ACTION
    ============================================================
    */

    const changeStudentAction = (
        studentId,
        action
    ) => {

        setStudentActions(previous => ({
            ...previous,
            [studentId]: action
        }));

    };


    /*
    ============================================================
    SELECT STUDENT
    ============================================================
    */

    const toggleStudent = studentId => {

        setSelectedStudents(previous => {

            if (previous.includes(studentId)) {

                return previous.filter(
                    id => id !== studentId
                );

            }

            return [
                ...previous,
                studentId
            ];

        });

    };


    /*
    ============================================================
    SELECT ALL
    ============================================================
    */

    const allSelected =
        students.length > 0 &&
        selectedStudents.length === students.length;


    const toggleSelectAll = () => {

        if (allSelected) {

            setSelectedStudents([]);

            return;

        }

        setSelectedStudents(
            students.map(
                student => student.student_id
            )
        );

    };


    /*
    ============================================================
    COUNTS
    ============================================================
    */

    const actionCounts = useMemo(() => {

        const counts = {
            Promoted: 0,
            Repeated: 0,
            Graduated: 0
        };

        selectedStudents.forEach(studentId => {

            const action =
                getStudentAction(studentId);

            if (
                counts[action] !== undefined
            ) {
                counts[action]++;
            }

        });

        return counts;

    }, [
        selectedStudents,
        studentActions,
        isSS3
    ]);


    /*
    ============================================================
    SELECTED DATA
    ============================================================
    */

    const selectedStudentData = useMemo(() => {

        return selectedStudents.map(studentId => {

            const action =
                getStudentAction(studentId);

            /*
             * Repeated students remain in their
             * current class and therefore do not need
             * a destination arm.
             */

            return {

                studentId,

                action,

                armId:
                    action === "Graduated" ||
                    action === "Repeated"
                        ? null
                        : (
                            destinationArmId
                                ? Number(destinationArmId)
                                : null
                        )

            };

        });

    }, [
        selectedStudents,
        studentActions,
        destinationArmId,
        isSS3
    ]);


    /*
    ============================================================
    CAN PROCESS
    ============================================================
    */

    const canProcess = useMemo(() => {

        if (
            promoting ||
            selectedStudents.length === 0
        ) {
            return false;
        }


        /*
         * SS3 students can only graduate.
         */

        if (isSS3) {

            return selectedStudentData.every(
                student =>
                    student.action === "Graduated"
            );

        }


        /*
         * There must be a next class if
         * any selected student is being promoted.
         */

        const hasPromoted =
            selectedStudentData.some(
                student =>
                    student.action === "Promoted"
            );

        if (
            hasPromoted &&
            !destinationClassId
        ) {
            return false;
        }


        /*
         * A destination arm is required
         * for promoted students.
         */

        if (
            hasPromoted &&
            !destinationArmId
        ) {
            return false;
        }


        return true;

    }, [
        promoting,
        selectedStudents,
        isSS3,
        selectedStudentData,
        destinationClassId,
        destinationArmId
    ]);


    /*
    ============================================================
    PROCESS
    ============================================================
    */

    const handlePromotion = () => {

        if (selectedStudents.length === 0) {

            alert(
                "Please select at least one student."
            );

            return;
        }


        /*
         * SS3 VALIDATION
         */

        if (isSS3) {

            const invalid =
                selectedStudentData.some(
                    student =>
                        student.action !== "Graduated"
                );

            if (invalid) {

                alert(
                    "SS3 students can only be graduated."
                );

                return;
            }

        }


        /*
         * PROMOTION VALIDATION
         */

        const hasPromoted =
            selectedStudentData.some(
                student =>
                    student.action === "Promoted"
            );


        if (!isSS3 && hasPromoted) {

            if (!destinationClassId) {

                alert(
                    "There is no next class configured for this class."
                );

                return;
            }


            if (!destinationArmId) {

                alert(
                    "Please select a destination arm for promoted students."
                );

                return;
            }

        }


        /*
         * CONFIRMATION
         */

        let confirmMessage;


        if (isSS3) {

            confirmMessage =
                `Graduate ${actionCounts.Graduated} student(s) from SS3 in ${setup.currentSession?.session_name || "the current session"}?`;

        } else {

            confirmMessage =
                `Process ${selectedStudents.length} student(s)?\n\n` +
                `Promoted: ${actionCounts.Promoted}\n` +
                `Repeated: ${actionCounts.Repeated}\n` +
                `Graduated: ${actionCounts.Graduated}\n\n` +
                (
                    actionCounts.Promoted > 0
                        ? `Destination: ${destinationClass?.class_name || "Not selected"}\n` +
                          `Destination Arm: Arm ${destinationArms.find(
                              arm =>
                                  String(arm.id) ===
                                  String(destinationArmId)
                          )?.arm_name || "Not selected"}`
                        : ""
                );

        }


        if (!window.confirm(confirmMessage)) {
            return;
        }


        /*
         * SEND TO API
         */

        promote(
            {
                students: selectedStudentData,

                destinationClassId:
                    destinationClassId
                        ? Number(destinationClassId)
                        : null,

                defaultArmId:
                    destinationArmId
                        ? Number(destinationArmId)
                        : null
            },
            {

                onSuccess: response => {

                    alert(
                        response?.message ||
                        (
                            isSS3
                                ? "Students graduated successfully."
                                : "Student decisions processed successfully."
                        )
                    );


                    setLastProcessed({

                        summary:
                            response?.summary,

                        data:
                            response?.data || []

                    });


                    setSelectedStudents([]);

                    setStudentActions({});

                    refetchStudents();

                },


                onError: error => {

                    console.error(
                        "Promotion error:",
                        error
                    );

                    alert(
                        error?.response?.data?.message ||
                        "Failed to process student decisions."
                    );

                }

            }
        );

    };


    /*
    ============================================================
    LOADING SCREEN
    ============================================================
    */

    if (setupLoading) {

        return (

            <div className="promotion-page">

                <div className="promotion-loading">

                    <Loader2
                        size={32}
                        className="spin text-primary"
                    />

                    <h5 className="mt-3 mb-1 fw-bold">
                        Loading Student Promotion
                    </h5>

                    <p className="text-muted mb-0">
                        Preparing academic progression tools...
                    </p>

                </div>

            </div>

        );

    }


    /*
    ============================================================
    ERROR SCREEN
    ============================================================
    */

    if (setupError || !setup) {

        return (

            <div className="promotion-page">

                <div className="promotion-error">

                    <div className="error-icon">
                        <UserX size={26} />
                    </div>

                    <h5 className="fw-bold mt-3">
                        Unable to load promotion information
                    </h5>

                    <p className="text-muted">
                        Please refresh the page and try again.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        <RefreshCw
                            size={16}
                            className="me-2"
                        />

                        Refresh Page
                    </button>

                </div>

            </div>

        );

    }


    /*
    ============================================================
    MAIN UI
    ============================================================
    */

    return (

        <div className="promotion-page">

            <div className="promotion-container">


                {/* HEADER */}

                <div className="page-header">

                    <div>

                        <div className="page-eyebrow">

                            <GraduationCap size={17} />

                            ACADEMIC MANAGEMENT

                        </div>

                        <h2>
                            Student Promotion
                        </h2>

                        <p>
                            Promote, repeat or graduate students
                            for the next academic session.
                        </p>

                    </div>


                    <div className="session-box">

                        <History size={18} />

                        <div>

                            <span>
                                Current Session
                            </span>

                            <strong>
                                {
                                    setup.currentSession
                                        ?.session_name ||
                                    "Not configured"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* SUMMARY */}

                <div className="summary-grid">

                    <div className="summary-card">

                        <div>

                            <span>
                                CURRENT CLASS
                            </span>

                            <strong>
                                {
                                    currentClass?.class_name ||
                                    "Not selected"
                                }
                            </strong>

                        </div>

                        <div className="summary-icon blue">
                            <Users size={20} />
                        </div>

                    </div>


                    <div className="summary-card">

                        <div>

                            <span>
                                STUDENTS FOUND
                            </span>

                            <strong>
                                {students.length}
                            </strong>

                        </div>

                        <div className="summary-icon green">
                            <UserCheck size={20} />
                        </div>

                    </div>


                    <div className="summary-card">

                        <div>

                            <span>
                                SELECTED
                            </span>

                            <strong className="selected-number">
                                {selectedStudents.length}
                            </strong>

                        </div>

                        <div className="summary-icon indigo">
                            <CheckCircle size={20} />
                        </div>

                    </div>

                </div>


                {/* SS3 NOTICE */}

                {isSS3 && (

                    <div className="ss3-notice">

                        <div className="ss3-icon">
                            <GraduationCap size={21} />
                        </div>

                        <div>

                            <strong>
                                SS3 Graduation
                            </strong>

                            <p>
                                SS3 is the final class.
                                Selected students can only be
                                graduated and cannot be promoted
                                to another class.
                            </p>

                        </div>

                    </div>

                )}


                {/* PROMOTION SETUP */}

                <div className="content-card">

                    <div className="card-header">

                        <div>

                            <h5>
                                Promotion Setup
                            </h5>

                            <p>
                                Select the current class and arm.
                                The next class is determined automatically.
                            </p>

                        </div>

                    </div>


                    <div className="card-body">

                        <div className="row g-3">


                            {/* CURRENT CLASS */}

                            <div className="col-lg-3 col-md-6">

                                <label className="form-label">
                                    Current Class
                                </label>

                                <select
                                    className="form-select"
                                    value={currentClassId}
                                    onChange={event =>
                                        setCurrentClassId(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select current class
                                    </option>

                                    {setup.classes.map(cls => (

                                        <option
                                            key={cls.id}
                                            value={cls.id}
                                        >
                                            {cls.class_name}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* CURRENT ARM */}

                            <div className="col-lg-3 col-md-6">

                                <label className="form-label">
                                    Current Arm
                                </label>

                                <select
                                    className="form-select"
                                    value={currentArmId}
                                    onChange={event =>
                                        setCurrentArmId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        !currentClassId ||
                                        currentArmsLoading
                                    }
                                >

                                    <option value="">
                                        All arms
                                    </option>

                                    {currentArms.map(arm => (

                                        <option
                                            key={arm.id}
                                            value={arm.id}
                                        >
                                            Arm {arm.arm_name}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* DESTINATION CLASS */}

                            <div className="col-lg-3 col-md-6">

                                <label className="form-label">
                                    Destination Class
                                </label>

                                {isSS3 ? (

                                    <div className="graduation-field">

                                        <GraduationCap size={17} />

                                        Graduation

                                    </div>

                                ) : (

                                    <div className="next-class-field">

                                        <div className="next-class-arrow">

                                            <ArrowRight size={16} />

                                        </div>

                                        <div>

                                            <span>
                                                NEXT CLASS
                                            </span>

                                            <strong>
                                                {
                                                    destinationClass?.class_name ||
                                                    "Not available"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* DESTINATION ARM */}

                            <div className="col-lg-3 col-md-6">

                                <label className="form-label">

                                    Destination Arm

                                    {!isSS3 &&
                                        actionCounts.Promoted > 0 && (
                                            <span className="required-label">
                                                Required
                                            </span>
                                        )
                                    }

                                </label>

                                <select
                                    className="form-select"
                                    value={destinationArmId}
                                    onChange={event =>
                                        setDestinationArmId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        isSS3 ||
                                        !destinationClassId ||
                                        destinationArmsLoading
                                    }
                                >

                                    <option value="">
                                        {
                                            isSS3
                                                ? "Not applicable"
                                                : destinationArmsLoading
                                                    ? "Loading arms..."
                                                    : "Select destination arm"
                                        }
                                    </option>

                                    {destinationArms.map(arm => (

                                        <option
                                            key={arm.id}
                                            value={arm.id}
                                        >
                                            Arm {arm.arm_name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>


                        {/* PROGRESSION DISPLAY */}

                        {currentClass && !isSS3 && destinationClass && (

                            <div className="progression-display">

                                <div className="progression-item current">

                                    <span>
                                        CURRENT
                                    </span>

                                    <strong>
                                        {currentClass.class_name}
                                    </strong>

                                </div>

                                <ArrowRight
                                    size={18}
                                    className="progression-arrow"
                                />

                                <div className="progression-item next">

                                    <span>
                                        NEXT SESSION
                                    </span>

                                    <strong>
                                        {destinationClass.class_name}
                                    </strong>

                                </div>

                            </div>

                        )}

                    </div>

                </div>


                {/* STUDENT LIST */}

                {currentClassId && (

                    <div className="content-card student-card">

                        <div className="card-header student-header">

                            <div>

                                <h5>
                                    Students
                                </h5>

                                <p>

                                    {students.length}
                                    {" "}student(s) found in{" "}

                                    <strong>
                                        {currentClass?.class_name}
                                    </strong>

                                    {currentArmId
                                        ? " for the selected arm."
                                        : "."
                                    }

                                </p>

                            </div>


                            <div className="student-badges">

                                <span className="count-badge selected">
                                    {selectedStudents.length} selected
                                </span>

                                {!isSS3 &&
                                    actionCounts.Promoted > 0 && (
                                        <span className="count-badge promoted">
                                            {actionCounts.Promoted} promoted
                                        </span>
                                    )
                                }

                                {!isSS3 &&
                                    actionCounts.Repeated > 0 && (
                                        <span className="count-badge repeated">
                                            {actionCounts.Repeated} repeated
                                        </span>
                                    )
                                }

                                {isSS3 &&
                                    actionCounts.Graduated > 0 && (
                                        <span className="count-badge graduated">
                                            {actionCounts.Graduated} graduating
                                        </span>
                                    )
                                }

                            </div>

                        </div>


                        {/* LOADING */}

                        {studentsLoading && (

                            <div className="table-state">

                                <Loader2
                                    size={30}
                                    className="spin text-primary"
                                />

                                <p>
                                    Loading students...
                                </p>

                            </div>

                        )}


                        {/* ERROR */}

                        {studentsError && (

                            <div className="state-wrapper">

                                <div className="error-alert">

                                    <UserX size={22} />

                                    <div>

                                        <strong>
                                            Unable to load students
                                        </strong>

                                        <p>
                                            Something went wrong while
                                            loading the students.
                                        </p>

                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                                refetchStudents()
                                            }
                                        >

                                            <RefreshCw
                                                size={14}
                                                className="me-1"
                                            />

                                            Retry

                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!studentsLoading &&
                            !studentsError &&
                            students.length === 0 && (

                                <div className="table-state">

                                    <div className="empty-icon">
                                        <Users size={26} />
                                    </div>

                                    <h6>
                                        No students found
                                    </h6>

                                    <p>
                                        There are no active students
                                        matching the selected class
                                        and arm.
                                    </p>

                                </div>

                            )
                        }


                        {/* TABLE */}

                        {!studentsLoading &&
                            !studentsError &&
                            students.length > 0 && (

                                <>

                                    <div className="table-responsive">

                                        <table className="table promotion-table mb-0">

                                            <thead>

                                                <tr>

                                                    <th className="checkbox-column">

                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={allSelected}
                                                            onChange={toggleSelectAll}
                                                            title="Select all students"
                                                        />

                                                    </th>

                                                    <th>
                                                        ADMISSION NO.
                                                    </th>

                                                    <th>
                                                        STUDENT
                                                    </th>

                                                    <th>
                                                        GENDER
                                                    </th>

                                                    <th>
                                                        CURRENT ARM
                                                    </th>

                                                    <th>
                                                        DECISION
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {students.map(student => {

                                                    const action =
                                                        getStudentAction(
                                                            student.student_id
                                                        );

                                                    const selected =
                                                        selectedStudents.includes(
                                                            student.student_id
                                                        );

                                                    const initials =
                                                        (
                                                            student.first_name?.[0] ||
                                                            student.surname?.[0] ||
                                                            "S"
                                                        ).toUpperCase();


                                                    return (

                                                        <tr
                                                            key={
                                                                student.student_id
                                                            }
                                                            className={
                                                                selected
                                                                    ? "student-selected"
                                                                    : ""
                                                            }
                                                        >

                                                            <td>

                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={selected}
                                                                    onChange={() =>
                                                                        toggleStudent(
                                                                            student.student_id
                                                                        )
                                                                    }
                                                                />

                                                            </td>


                                                            <td>

                                                                <span className="admission-number">

                                                                    {
                                                                        student.admission_number
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <div className="student-name">

                                                                    <div className="student-avatar">
                                                                        {initials}
                                                                    </div>

                                                                    <div>

                                                                        <strong>

                                                                            {
                                                                                student.surname
                                                                            }{" "}

                                                                            {
                                                                                student.first_name
                                                                            }{" "}

                                                                            {
                                                                                student.middle_name ||
                                                                                ""
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                <span className="muted-value">

                                                                    {
                                                                        student.gender ||
                                                                        "—"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <span className="arm-badge">

                                                                    {
                                                                        student.arm_name ||
                                                                        "No arm"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                {isSS3 ? (

                                                                    <span className="graduate-badge">

                                                                        <GraduationCap
                                                                            size={15}
                                                                        />

                                                                        Graduate

                                                                    </span>

                                                                ) : (

                                                                    <select
                                                                        className={`form-select decision-select ${
                                                                            action === "Promoted"
                                                                                ? "decision-promote"
                                                                                : "decision-repeat"
                                                                        }`}
                                                                        value={action}
                                                                        onChange={event =>
                                                                            changeStudentAction(
                                                                                student.student_id,
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                    >

                                                                        <option value="Promoted">
                                                                            Promote
                                                                        </option>

                                                                        <option value="Repeated">
                                                                            Repeat
                                                                        </option>

                                                                    </select>

                                                                )}

                                                            </td>

                                                        </tr>

                                                    );

                                                })}

                                            </tbody>

                                        </table>

                                    </div>


                                    {/* ACTION FOOTER */}

                                    <div className="promotion-footer">

                                        <div>

                                            <strong>

                                                {selectedStudents.length}
                                                {" "}student(s) selected

                                            </strong>

                                            <div className="footer-summary">

                                                {isSS3 ? (

                                                    <span className="gold-text">

                                                        {actionCounts.Graduated}
                                                        {" "}student(s) will graduate.

                                                    </span>

                                                ) : (

                                                    <>

                                                        <span className="green-text">

                                                            {actionCounts.Promoted}
                                                            {" "}promoted

                                                        </span>

                                                        <span>
                                                            •
                                                        </span>

                                                        <span className="orange-text">

                                                            {actionCounts.Repeated}
                                                            {" "}repeated

                                                        </span>

                                                    </>

                                                )}

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            className="process-button"
                                            disabled={!canProcess}
                                            onClick={handlePromotion}
                                        >

                                            {promoting ? (

                                                <>

                                                    <Loader2
                                                        size={17}
                                                        className="me-2 spin"
                                                    />

                                                    Processing...

                                                </>

                                            ) : (

                                                <>

                                                    {isSS3 ? (

                                                        <GraduationCap
                                                            size={17}
                                                            className="me-2"
                                                        />

                                                    ) : (

                                                        <ArrowRight
                                                            size={17}
                                                            className="me-2"
                                                        />

                                                    )}

                                                    {
                                                        isSS3
                                                            ? "Process Graduation"
                                                            : "Process Decisions"
                                                    }

                                                </>

                                            )}

                                        </button>

                                    </div>

                                </>

                            )}

                    </div>

                )}


                {/* LAST PROCESSED */}

                {lastProcessed && (

                    <div className="content-card success-card">

                        <div className="card-header">

                            <div className="success-heading">

                                <div className="success-icon">
                                    <CheckCircle size={21} />
                                </div>

                                <div>

                                    <h5>
                                        Operation Completed
                                    </h5>

                                    <p>
                                        The latest academic progression
                                        decisions were processed successfully.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="card-body">

                            <div className="result-grid">

                                <div className="result-box promoted-box">

                                    <span>
                                        PROMOTED
                                    </span>

                                    <strong>
                                        {
                                            lastProcessed.summary
                                                ?.promoted || 0
                                        }
                                    </strong>

                                </div>


                                <div className="result-box repeated-box">

                                    <span>
                                        REPEATED
                                    </span>

                                    <strong>
                                        {
                                            lastProcessed.summary
                                                ?.repeated || 0
                                        }
                                    </strong>

                                </div>


                                <div className="result-box graduated-box">

                                    <span>
                                        GRADUATED
                                    </span>

                                    <strong>
                                        {
                                            lastProcessed.summary
                                                ?.graduated || 0
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


                {/* NO NEXT CLASS */}

                {!isSS3 &&
                    currentClassId &&
                    !destinationClass && (

                        <div className="warning-card">

                            <div className="warning-title">
                                Promotion unavailable
                            </div>

                            <p>
                                No next class is configured for{" "}
                                <strong>
                                    {currentClass?.class_name}
                                </strong>.
                                Please check the class configuration.
                            </p>

                        </div>

                    )
                }


                {/* NO NEXT SESSION */}

                {!setup.nextSession && !isSS3 && (

                    <div className="warning-card">

                        <div className="warning-title">
                            Next academic session unavailable
                        </div>

                        <p>
                            There is no next academic session configured.
                            Configure the next session before processing
                            promotions.
                        </p>

                    </div>

                )}

            </div>


            {/* PAGE STYLES */}

            <style>{`

                .promotion-page {
                    min-height: 100vh;
                    background: #f6f8fb;
                    padding: 24px 28px 40px;
                }

                .promotion-container {
                    width: 100%;
                    max-width: 1500px;
                    margin: 0 auto;
                }


                /* HEADER */

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 22px;
                }

                .page-eyebrow {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #2563eb;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: .05em;
                    margin-bottom: 6px;
                }

                .page-header h2 {
                    margin: 0;
                    color: #111827;
                    font-size: 25px;
                    font-weight: 700;
                }

                .page-header p {
                    margin: 5px 0 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .session-box {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 9px;
                    padding: 10px 14px;
                    min-width: 190px;
                }

                .session-box svg {
                    color: #2563eb;
                }

                .session-box div {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .session-box span {
                    color: #94a3b8;
                    font-size: 11px;
                }

                .session-box strong {
                    color: #1e293b;
                    font-size: 13px;
                }


                /* SUMMARY */

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 14px;
                    margin-bottom: 18px;
                }

                .summary-card {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 17px 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .summary-card span {
                    display: block;
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: .04em;
                }

                .summary-card strong {
                    display: block;
                    color: #1e293b;
                    font-size: 20px;
                    line-height: 1.2;
                    margin-top: 4px;
                }

                .summary-card .selected-number {
                    color: #2563eb;
                }

                .summary-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .summary-icon.blue {
                    color: #2563eb;
                    background: #eff6ff;
                }

                .summary-icon.green {
                    color: #16a34a;
                    background: #f0fdf4;
                }

                .summary-icon.indigo {
                    color: #4f46e5;
                    background: #eef2ff;
                }


                /* SS3 */

                .ss3-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 10px;
                    padding: 13px 15px;
                    margin-bottom: 18px;
                }

                .ss3-icon {
                    width: 38px;
                    height: 38px;
                    flex-shrink: 0;
                    border-radius: 8px;
                    background: #fef3c7;
                    color: #b45309;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ss3-notice strong {
                    display: block;
                    color: #92400e;
                    font-size: 13px;
                    margin-bottom: 3px;
                }

                .ss3-notice p {
                    margin: 0;
                    color: #92400e;
                    font-size: 12px;
                }


                /* CONTENT CARD */

                .content-card {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 18px;
                }

                .card-header {
                    padding: 15px 18px;
                    border-bottom: 1px solid #eef0f3;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-header h5 {
                    color: #1e293b;
                    font-size: 15px;
                    font-weight: 700;
                    margin: 0 0 3px;
                }

                .card-header p {
                    color: #94a3b8;
                    font-size: 12px;
                    margin: 0;
                }

                .card-body {
                    padding: 18px;
                }


                /* FORM */

                .form-label {
                    color: #475569;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 6px;
                }

                .required-label {
                    margin-left: 7px;
                    color: #dc2626;
                    font-size: 10px;
                    font-weight: 700;
                }

                .form-select {
                    height: 42px;
                    border-color: #dfe3e8;
                    border-radius: 7px;
                    color: #334155;
                    font-size: 13px;
                    box-shadow: none !important;
                }

                .form-select:focus {
                    border-color: #93c5fd;
                }

                .form-select:disabled {
                    background: #f8fafc;
                    color: #94a3b8;
                }

                .graduation-field {
                    height: 42px;
                    border-radius: 7px;
                    border: 1px solid #fde68a;
                    background: #fffbeb;
                    color: #92400e;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 12px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .next-class-field {
                    height: 42px;
                    border-radius: 7px;
                    border: 1px solid #bfdbfe;
                    background: #eff6ff;
                    color: #1d4ed8;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    padding: 0 11px;
                }

                .next-class-arrow {
                    width: 27px;
                    height: 27px;
                    border-radius: 6px;
                    background: #dbeafe;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .next-class-field div:last-child {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.1;
                }

                .next-class-field span {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: .04em;
                    opacity: .7;
                }

                .next-class-field strong {
                    font-size: 13px;
                }


                /* PROGRESSION */

                .progression-display {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 17px;
                    padding: 12px;
                    border-radius: 8px;
                    background: #f8fafc;
                    border: 1px solid #eef2f7;
                }

                .progression-item {
                    min-width: 125px;
                    padding: 8px 12px;
                    border-radius: 7px;
                }

                .progression-item.current {
                    background: #f1f5f9;
                }

                .progression-item.next {
                    background: #eff6ff;
                }

                .progression-item span {
                    display: block;
                    font-size: 8px;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 3px;
                }

                .progression-item strong {
                    color: #334155;
                    font-size: 13px;
                }

                .progression-item.next strong {
                    color: #1d4ed8;
                }

                .progression-arrow {
                    color: #94a3b8;
                }


                /* STUDENT HEADER */

                .student-header {
                    min-height: 68px;
                }

                .student-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    justify-content: flex-end;
                }

                .count-badge {
                    padding: 5px 9px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .count-badge.selected {
                    background: #eff6ff;
                    color: #1d4ed8;
                }

                .count-badge.promoted {
                    background: #f0fdf4;
                    color: #15803d;
                }

                .count-badge.repeated {
                    background: #fff7ed;
                    color: #c2410c;
                }

                .count-badge.graduated {
                    background: #fffbeb;
                    color: #a16207;
                }


                /* TABLE */

                .promotion-table {
                    min-width: 900px;
                }

                .promotion-table thead th {
                    background: #f8fafc;
                    border-bottom: 1px solid #e5e7eb;
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: .04em;
                    padding: 12px 14px;
                    white-space: nowrap;
                }

                .promotion-table tbody td {
                    padding: 12px 14px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 13px;
                    vertical-align: middle;
                }

                .promotion-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .promotion-table tbody tr:hover {
                    background: #fafcff;
                }

                .promotion-table tbody tr.student-selected {
                    background: #f7fbff;
                }

                .promotion-table .checkbox-column {
                    width: 48px;
                    padding-left: 18px;
                }

                .form-check-input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }

                .form-check-input:checked {
                    background-color: #2563eb;
                    border-color: #2563eb;
                }

                .admission-number {
                    color: #475569;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .student-name {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 210px;
                }

                .student-avatar {
                    width: 34px;
                    height: 34px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: #f1f5f9;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                }

                .student-selected .student-avatar {
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                .student-name strong {
                    color: #1e293b;
                    font-size: 13px;
                    font-weight: 600;
                }

                .muted-value {
                    color: #64748b;
                    font-size: 12px;
                }

                .arm-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 5px;
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 11px;
                    font-weight: 600;
                }

                .decision-select {
                    width: 130px;
                    height: 34px;
                    padding-top: 3px;
                    padding-bottom: 3px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .decision-promote {
                    color: #15803d;
                    border-color: #bbf7d0;
                    background: #f0fdf4;
                }

                .decision-repeat {
                    color: #c2410c;
                    border-color: #fed7aa;
                    background: #fff7ed;
                }

                .graduate-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 9px;
                    border-radius: 6px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    color: #a16207;
                    font-size: 11px;
                    font-weight: 600;
                }


                /* ACTION FOOTER */

                .promotion-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 14px 18px;
                    background: #f8fafc;
                    border-top: 1px solid #e5e7eb;
                }

                .promotion-footer strong {
                    display: block;
                    color: #1e293b;
                    font-size: 13px;
                }

                .footer-summary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 3px;
                    color: #94a3b8;
                    font-size: 11px;
                }

                .green-text {
                    color: #15803d;
                }

                .orange-text {
                    color: #c2410c;
                }

                .gold-text {
                    color: #a16207;
                }

                .process-button {
                    height: 40px;
                    border: none;
                    border-radius: 7px;
                    background: #2563eb;
                    color: #fff;
                    padding: 0 17px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                }

                .process-button:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .process-button:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }


                /* STATES */

                .table-state {
                    min-height: 250px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }

                .table-state p {
                    margin: 10px 0 0;
                    font-size: 12px;
                }

                .empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10px;
                }

                .table-state h6 {
                    color: #334155;
                    font-size: 14px;
                    margin: 0 0 3px;
                }

                .table-state h6 + p {
                    margin-top: 0;
                    color: #94a3b8;
                }

                .state-wrapper {
                    padding: 18px;
                }

                .error-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                }

                .error-alert strong {
                    font-size: 13px;
                }

                .error-alert p {
                    color: #64748b;
                    font-size: 12px;
                    margin: 3px 0 10px;
                }


                /* SUCCESS */

                .success-heading {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .success-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    background: #f0fdf4;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .success-heading h5 {
                    margin: 0 0 3px;
                    color: #1e293b;
                    font-size: 15px;
                }

                .success-heading p {
                    margin: 0;
                    color: #94a3b8;
                    font-size: 12px;
                }

                .result-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .result-box {
                    padding: 13px;
                    border-radius: 8px;
                }

                .result-box span {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    color: #64748b;
                }

                .result-box strong {
                    display: block;
                    font-size: 23px;
                    margin-top: 2px;
                }

                .promoted-box {
                    background: #eff6ff;
                }

                .promoted-box strong {
                    color: #2563eb;
                }

                .repeated-box {
                    background: #fff7ed;
                }

                .repeated-box strong {
                    color: #c2410c;
                }

                .graduated-box {
                    background: #fffbeb;
                }

                .graduated-box strong {
                    color: #a16207;
                }


                /* WARNING */

                .warning-card {
                    padding: 14px 16px;
                    border-radius: 9px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    margin-bottom: 18px;
                }

                .warning-title {
                    color: #92400e;
                    font-size: 13px;
                    font-weight: 700;
                }

                .warning-card p {
                    color: #92400e;
                    font-size: 12px;
                    margin: 3px 0 0;
                }


                /* LOADING */

                .promotion-loading {
                    min-height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .promotion-loading h5 {
                    color: #1e293b;
                }

                .promotion-loading p {
                    font-size: 13px;
                }


                /* ERROR */

                .promotion-error {
                    max-width: 500px;
                    margin: 100px auto;
                    padding: 35px;
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    text-align: center;
                }

                .error-icon {
                    width: 55px;
                    height: 55px;
                    margin: 0 auto;
                    border-radius: 50%;
                    background: #fef2f2;
                    color: #dc2626;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }


                /* ANIMATION */

                .spin {
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


                /* RESPONSIVE */

                @media (max-width: 992px) {

                    .promotion-page {
                        padding: 20px;
                    }

                    .page-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .session-box {
                        width: 100%;
                    }

                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .student-header {
                        align-items: flex-start;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .student-badges {
                        justify-content: flex-start;
                    }

                }


                @media (max-width: 768px) {

                    .promotion-page {
                        padding: 15px;
                    }

                    .page-header h2 {
                        font-size: 22px;
                    }

                    .card-body {
                        padding: 14px;
                    }

                    .promotion-footer {
                        align-items: stretch;
                        flex-direction: column;
                    }

                    .process-button {
                        width: 100%;
                    }

                    .result-grid {
                        grid-template-columns: 1fr;
                    }

                    .progression-display {
                        overflow-x: auto;
                    }

                    .progression-item {
                        min-width: 110px;
                    }

                }

            `}</style>

        </div>

    );

}


export default StudentPromotionPage;

// import {
//     useEffect,
//     useMemo,
//     useState
// } from "react";

// import {
//     ArrowRight,
//     CheckCircle,
//     GraduationCap,
//     History,
//     Loader2,
//     RefreshCw,
//     Users,
//     UserCheck,
//     UserX
// } from "lucide-react";

// import { usePromotionSetup } from "@/hooks/usePromotionSetup";
// import { usePromotionStudents } from "@/hooks/usePromotionStudents";
// import { usePromotionArms } from "@/hooks/usePromotionArms";
// import { usePromoteStudents } from "@/hooks/usePromoteStudents";


// function StudentPromotionPage() {

//     /*
//     ============================================================
//     DATA
//     ============================================================
//     */

//     const {
//         data: setup,
//         isLoading: setupLoading,
//         isError: setupError
//     } = usePromotionSetup();


//     /*
//     ============================================================
//     STATE
//     ============================================================
//     */

//     const [currentClassId, setCurrentClassId] = useState("");
//     const [currentArmId, setCurrentArmId] = useState("");
//     const [destinationClassId, setDestinationClassId] = useState("");
//     const [destinationArmId, setDestinationArmId] = useState("");

//     const [selectedStudents, setSelectedStudents] = useState([]);

//     const [studentActions, setStudentActions] = useState({});

//     const [lastProcessed, setLastProcessed] = useState(null);


//     /*
//     ============================================================
//     CURRENT CLASS
//     ============================================================
//     */

//     const currentClass = useMemo(() => {

//         if (!setup?.classes) {
//             return null;
//         }

//         return setup.classes.find(
//             cls =>
//                 String(cls.id) === String(currentClassId)
//         );

//     }, [setup, currentClassId]);


//     /*
//     ============================================================
//     SS3
//     ============================================================
//     */

//     const isSS3 = useMemo(() => {

//         if (!currentClass) {
//             return false;
//         }

//         const className =
//             String(currentClass.class_name || "")
//                 .trim()
//                 .toUpperCase();

//         const classLevel =
//             String(currentClass.class_level || "")
//                 .trim()
//                 .toUpperCase();

//         return (
//             className === "SS3" ||
//             classLevel === "SS3"
//         );

//     }, [currentClass]);


//     /*
//     ============================================================
//     CURRENT ARMS
//     ============================================================
//     */

//     const {
//         data: currentArms = [],
//         isLoading: currentArmsLoading
//     } = usePromotionArms(currentClassId);


//     /*
//     ============================================================
//     STUDENTS
//     ============================================================
//     */

//     const {
//         data: students = [],
//         isLoading: studentsLoading,
//         isError: studentsError,
//         refetch: refetchStudents
//     } = usePromotionStudents({

//         classId:
//             currentClassId
//                 ? Number(currentClassId)
//                 : null,

//         armId:
//             currentArmId
//                 ? Number(currentArmId)
//                 : null

//     });


//     /*
//     ============================================================
//     DESTINATION ARMS
//     ============================================================
//     */

//     const {
//         data: destinationArms = [],
//         isLoading: destinationArmsLoading
//     } = usePromotionArms(destinationClassId);


//     /*
//     ============================================================
//     MUTATION
//     ============================================================
//     */

//     const {
//         mutate: promote,
//         isPending: promoting
//     } = usePromoteStudents();


//     /*
//     ============================================================
//     AUTOMATIC DESTINATION CLASS
//     ============================================================
//     */

//     useEffect(() => {

//         if (
//             !currentClassId ||
//             !setup?.classes?.length
//         ) {
//             setDestinationClassId("");
//             return;
//         }

//         if (isSS3) {
//             setDestinationClassId("");
//             return;
//         }

//         const currentIndex =
//             setup.classes.findIndex(
//                 cls =>
//                     String(cls.id) ===
//                     String(currentClassId)
//             );

//         if (currentIndex === -1) {
//             setDestinationClassId("");
//             return;
//         }

//         const nextClass =
//             setup.classes[currentIndex + 1];

//         const nextId =
//             nextClass
//                 ? String(nextClass.id)
//                 : "";

//         setDestinationClassId(previous =>
//             previous === nextId
//                 ? previous
//                 : nextId
//         );

//     }, [
//         currentClassId,
//         setup,
//         isSS3
//     ]);


//     /*
//     ============================================================
//     RESET CURRENT ARM
//     ============================================================
//     */

//     useEffect(() => {

//         setCurrentArmId("");

//     }, [currentClassId]);


//     /*
//     ============================================================
//     RESET DESTINATION ARM
//     ============================================================
//     */

//     useEffect(() => {

//         setDestinationArmId("");

//     }, [destinationClassId]);


//     /*
//     ============================================================
//     RESET SELECTION
//     ============================================================
//     */

//     useEffect(() => {

//         setSelectedStudents([]);
//         setStudentActions({});
//         setLastProcessed(null);

//     }, [
//         currentClassId,
//         currentArmId
//     ]);


//     /*
//     ============================================================
//     STUDENT ACTION
//     ============================================================
//     */

//     const getStudentAction = studentId => {

//         return (
//             studentActions[studentId] ||
//             (
//                 isSS3
//                     ? "Graduated"
//                     : "Promoted"
//             )
//         );

//     };


//     /*
//     ============================================================
//     CHANGE ACTION
//     ============================================================
//     */

//     const changeStudentAction = (
//         studentId,
//         action
//     ) => {

//         setStudentActions(previous => ({
//             ...previous,
//             [studentId]: action
//         }));

//     };


//     /*
//     ============================================================
//     SELECT STUDENT
//     ============================================================
//     */

//     const toggleStudent = studentId => {

//         setSelectedStudents(previous => {

//             if (previous.includes(studentId)) {

//                 return previous.filter(
//                     id => id !== studentId
//                 );

//             }

//             return [
//                 ...previous,
//                 studentId
//             ];

//         });

//     };


//     /*
//     ============================================================
//     SELECT ALL
//     ============================================================
//     */

//     const allSelected =
//         students.length > 0 &&
//         selectedStudents.length === students.length;


//     const toggleSelectAll = () => {

//         if (allSelected) {

//             setSelectedStudents([]);

//             return;

//         }

//         setSelectedStudents(
//             students.map(
//                 student => student.student_id
//             )
//         );

//     };


//     /*
//     ============================================================
//     COUNTS
//     ============================================================
//     */

//     const actionCounts = useMemo(() => {

//         const counts = {
//             Promoted: 0,
//             Repeated: 0,
//             Graduated: 0
//         };

//         selectedStudents.forEach(studentId => {

//             const action =
//                 getStudentAction(studentId);

//             if (
//                 counts[action] !== undefined
//             ) {
//                 counts[action]++;
//             }

//         });

//         return counts;

//     }, [
//         selectedStudents,
//         studentActions,
//         isSS3
//     ]);


//     /*
//     ============================================================
//     SELECTED DATA
//     ============================================================
//     */

//     const selectedStudentData = useMemo(() => {

//         return selectedStudents.map(studentId => {

//             const action =
//                 getStudentAction(studentId);

//             return {

//                 studentId,

//                 action,

//                 armId:
//                     action === "Graduated"
//                         ? null
//                         : (
//                             destinationArmId
//                                 ? Number(destinationArmId)
//                                 : null
//                         )

//             };

//         });

//     }, [
//         selectedStudents,
//         studentActions,
//         destinationArmId,
//         isSS3
//     ]);


//     /*
//     ============================================================
//     CAN PROCESS
//     ============================================================
//     */

//     const canProcess = useMemo(() => {

//         if (
//             promoting ||
//             selectedStudents.length === 0
//         ) {
//             return false;
//         }

//         if (isSS3) {

//             return selectedStudentData.every(
//                 student =>
//                     student.action === "Graduated"
//             );

//         }

//         const hasPromoted =
//             selectedStudentData.some(
//                 student =>
//                     student.action === "Promoted"
//             );

//         if (
//             hasPromoted &&
//             !destinationClassId
//         ) {
//             return false;
//         }

//         return true;

//     }, [
//         promoting,
//         selectedStudents,
//         isSS3,
//         selectedStudentData,
//         destinationClassId
//     ]);


//     /*
//     ============================================================
//     PROCESS
//     ============================================================
//     */

//     const handlePromotion = () => {

//         if (selectedStudents.length === 0) {

//             alert(
//                 "Please select at least one student."
//             );

//             return;
//         }


//         if (isSS3) {

//             const invalid =
//                 selectedStudentData.some(
//                     student =>
//                         student.action !== "Graduated"
//                 );

//             if (invalid) {

//                 alert(
//                     "SS3 students can only be graduated."
//                 );

//                 return;
//             }

//         }


//         const hasPromoted =
//             selectedStudentData.some(
//                 student =>
//                     student.action === "Promoted"
//             );


//         if (
//             !isSS3 &&
//             hasPromoted &&
//             !destinationClassId
//         ) {

//             alert(
//                 "Please select a destination class."
//             );

//             return;
//         }


//         const destinationClass =
//             setup?.classes?.find(
//                 cls =>
//                     String(cls.id) ===
//                     String(destinationClassId)
//             );


//         let confirmMessage;


//         if (isSS3) {

//             confirmMessage =
//                 `Graduate ${actionCounts.Graduated} student(s) from SS3 in ${setup.currentSession?.session_name}?`;

//         } else {

//             confirmMessage =
//                 `Process ${selectedStudents.length} student(s)?\n\n` +
//                 `Promoted: ${actionCounts.Promoted}\n` +
//                 `Repeated: ${actionCounts.Repeated}\n` +
//                 `Graduated: ${actionCounts.Graduated}\n\n` +
//                 (
//                     actionCounts.Promoted > 0
//                         ? `Destination: ${destinationClass?.class_name || "Not selected"}`
//                         : ""
//                 );

//         }


//         if (!window.confirm(confirmMessage)) {
//             return;
//         }


//         promote(
//             {
//                 students: selectedStudentData,

//                 destinationClassId:
//                     destinationClassId
//                         ? Number(destinationClassId)
//                         : null,

//                 defaultArmId:
//                     destinationArmId
//                         ? Number(destinationArmId)
//                         : null
//             },
//             {

//                 onSuccess: response => {

//                     alert(
//                         response?.message ||
//                         (
//                             isSS3
//                                 ? "Students graduated successfully."
//                                 : "Student decisions processed successfully."
//                         )
//                     );


//                     setLastProcessed({
//                         summary: response?.summary,
//                         data: response?.data || []
//                     });


//                     setSelectedStudents([]);

//                     refetchStudents();

//                 },


//                 onError: error => {

//                     console.error(
//                         "Promotion error:",
//                         error
//                     );

//                     alert(
//                         error?.response?.data?.message ||
//                         "Failed to process student decisions."
//                     );

//                 }

//             }
//         );

//     };


//     /*
//     ============================================================
//     LOADING SCREEN
//     ============================================================
//     */

//     if (setupLoading) {

//         return (

//             <div className="promotion-page">

//                 <div className="promotion-loading">

//                     <Loader2
//                         size={32}
//                         className="spin text-primary"
//                     />

//                     <h5 className="mt-3 mb-1 fw-bold">
//                         Loading Student Promotion
//                     </h5>

//                     <p className="text-muted mb-0">
//                         Preparing academic progression tools...
//                     </p>

//                 </div>

//             </div>

//         );

//     }


//     /*
//     ============================================================
//     ERROR SCREEN
//     ============================================================
//     */

//     if (setupError || !setup) {

//         return (

//             <div className="promotion-page">

//                 <div className="promotion-error">

//                     <div className="error-icon">
//                         <UserX size={26} />
//                     </div>

//                     <h5 className="fw-bold mt-3">
//                         Unable to load promotion information
//                     </h5>

//                     <p className="text-muted">
//                         Please refresh the page and try again.
//                     </p>

//                     <button
//                         className="btn btn-primary"
//                         onClick={() =>
//                             window.location.reload()
//                         }
//                     >
//                         <RefreshCw
//                             size={16}
//                             className="me-2"
//                         />

//                         Refresh Page
//                     </button>

//                 </div>

//             </div>

//         );

//     }


//     /*
//     ============================================================
//     MAIN UI
//     ============================================================
//     */

//     return (

//         <div className="promotion-page">

//             <div className="promotion-container">


//                 {/* ==================================================
//                     PAGE HEADER
//                 ================================================== */}

//                 <div className="page-header">

//                     <div>

//                         <div className="page-eyebrow">
//                             <GraduationCap size={17} />
//                             ACADEMIC MANAGEMENT
//                         </div>

//                         <h2>
//                             Student Promotion
//                         </h2>

//                         <p>
//                             Promote, repeat or graduate students
//                             for the next academic session.
//                         </p>

//                     </div>


//                     <div className="session-box">

//                         <History size={18} />

//                         <div>

//                             <span>
//                                 Current Session
//                             </span>

//                             <strong>
//                                 {
//                                     setup.currentSession
//                                         ?.session_name ||
//                                     "Not configured"
//                                 }
//                             </strong>

//                         </div>

//                     </div>

//                 </div>


//                 {/* ==================================================
//                     QUICK SUMMARY
//                 ================================================== */}

//                 <div className="summary-grid">

//                     <div className="summary-card">

//                         <div>

//                             <span>
//                                 CURRENT CLASS
//                             </span>

//                             <strong>
//                                 {
//                                     currentClass?.class_name ||
//                                     "Not selected"
//                                 }
//                             </strong>

//                         </div>

//                         <div className="summary-icon blue">
//                             <Users size={20} />
//                         </div>

//                     </div>


//                     <div className="summary-card">

//                         <div>

//                             <span>
//                                 STUDENTS FOUND
//                             </span>

//                             <strong>
//                                 {students.length}
//                             </strong>

//                         </div>

//                         <div className="summary-icon green">
//                             <UserCheck size={20} />
//                         </div>

//                     </div>


//                     <div className="summary-card">

//                         <div>

//                             <span>
//                                 SELECTED
//                             </span>

//                             <strong className="selected-number">
//                                 {selectedStudents.length}
//                             </strong>

//                         </div>

//                         <div className="summary-icon indigo">
//                             <CheckCircle size={20} />
//                         </div>

//                     </div>

//                 </div>


//                 {/* ==================================================
//                     SS3 NOTICE
//                 ================================================== */}

//                 {isSS3 && (

//                     <div className="ss3-notice">

//                         <div className="ss3-icon">
//                             <GraduationCap size={21} />
//                         </div>

//                         <div>

//                             <strong>
//                                 SS3 Graduation
//                             </strong>

//                             <p>
//                                 SS3 is the final class.
//                                 Selected students can only be
//                                 graduated and cannot be promoted
//                                 to another class.
//                             </p>

//                         </div>

//                     </div>

//                 )}


//                 {/* ==================================================
//                     PROMOTION SETUP
//                 ================================================== */}

//                 <div className="content-card">

//                     <div className="card-header">

//                         <div>

//                             <h5>
//                                 Promotion Setup
//                             </h5>

//                             <p>
//                                 Select the current class and destination
//                                 for the academic progression.
//                             </p>

//                         </div>

//                     </div>


//                     <div className="card-body">

//                         <div className="row g-3">

//                             {/* CURRENT CLASS */}

//                             <div className="col-lg-3 col-md-6">

//                                 <label className="form-label">
//                                     Current Class
//                                 </label>

//                                 <select
//                                     className="form-select"
//                                     value={currentClassId}
//                                     onChange={event =>
//                                         setCurrentClassId(
//                                             event.target.value
//                                         )
//                                     }
//                                 >

//                                     <option value="">
//                                         Select current class
//                                     </option>

//                                     {setup.classes.map(cls => (

//                                         <option
//                                             key={cls.id}
//                                             value={cls.id}
//                                         >
//                                             {cls.class_name}
//                                         </option>

//                                     ))}

//                                 </select>

//                             </div>


//                             {/* CURRENT ARM */}

//                             <div className="col-lg-3 col-md-6">

//                                 <label className="form-label">
//                                     Current Arm
//                                 </label>

//                                 <select
//                                     className="form-select"
//                                     value={currentArmId}
//                                     onChange={event =>
//                                         setCurrentArmId(
//                                             event.target.value
//                                         )
//                                     }
//                                     disabled={
//                                         !currentClassId ||
//                                         currentArmsLoading
//                                     }
//                                 >

//                                     <option value="">
//                                         All arms
//                                     </option>

//                                     {currentArms.map(arm => (

//                                         <option
//                                             key={arm.id}
//                                             value={arm.id}
//                                         >
//                                             Arm {arm.arm_name}
//                                         </option>

//                                     ))}

//                                 </select>

//                             </div>


//                             {/* DESTINATION CLASS */}

//                             <div className="col-lg-3 col-md-6">

//                                 <label className="form-label">
//                                     Destination Class
//                                 </label>

//                                 {isSS3 ? (

//                                     <div className="graduation-field">

//                                         <GraduationCap size={17} />

//                                         Graduation

//                                     </div>

//                                 ) : (

//                                     <select
//                                         className="form-select"
//                                         value={destinationClassId}
//                                         onChange={event =>
//                                             setDestinationClassId(
//                                                 event.target.value
//                                             )
//                                         }
//                                         disabled={!currentClassId}
//                                     >

//                                         <option value="">
//                                             Select destination
//                                         </option>

//                                         {setup.classes.map(cls => (

//                                             <option
//                                                 key={cls.id}
//                                                 value={cls.id}
//                                             >
//                                                 {cls.class_name}
//                                             </option>

//                                         ))}

//                                     </select>

//                                 )}

//                             </div>


//                             {/* DESTINATION ARM */}

//                             <div className="col-lg-3 col-md-6">

//                                 <label className="form-label">
//                                     Destination Arm
//                                 </label>

//                                 <select
//                                     className="form-select"
//                                     value={destinationArmId}
//                                     onChange={event =>
//                                         setDestinationArmId(
//                                             event.target.value
//                                         )
//                                     }
//                                     disabled={
//                                         isSS3 ||
//                                         !destinationClassId ||
//                                         destinationArmsLoading
//                                     }
//                                 >

//                                     <option value="">
//                                         {
//                                             isSS3
//                                                 ? "Not applicable"
//                                                 : "Select destination arm"
//                                         }
//                                     </option>

//                                     {destinationArms.map(arm => (

//                                         <option
//                                             key={arm.id}
//                                             value={arm.id}
//                                         >
//                                             Arm {arm.arm_name}
//                                         </option>

//                                     ))}

//                                 </select>

//                             </div>

//                         </div>

//                     </div>

//                 </div>


//                 {/* ==================================================
//                     STUDENT LIST
//                 ================================================== */}

//                 {currentClassId && (

//                     <div className="content-card student-card">

//                         <div className="card-header student-header">

//                             <div>

//                                 <h5>
//                                     Students
//                                 </h5>

//                                 <p>
//                                     {
//                                         students.length
//                                     } student(s) found in{" "}

//                                     <strong>
//                                         {currentClass?.class_name}
//                                     </strong>

//                                     {currentArmId
//                                         ? " for the selected arm."
//                                         : "."
//                                     }

//                                 </p>

//                             </div>


//                             <div className="student-badges">

//                                 <span className="count-badge selected">
//                                     {selectedStudents.length} selected
//                                 </span>

//                                 {!isSS3 &&
//                                     actionCounts.Promoted > 0 && (
//                                         <span className="count-badge promoted">
//                                             {actionCounts.Promoted} promoted
//                                         </span>
//                                     )
//                                 }

//                                 {!isSS3 &&
//                                     actionCounts.Repeated > 0 && (
//                                         <span className="count-badge repeated">
//                                             {actionCounts.Repeated} repeated
//                                         </span>
//                                     )
//                                 }

//                                 {isSS3 &&
//                                     actionCounts.Graduated > 0 && (
//                                         <span className="count-badge graduated">
//                                             {actionCounts.Graduated} graduating
//                                         </span>
//                                     )
//                                 }

//                             </div>

//                         </div>


//                         {/* LOADING */}

//                         {studentsLoading && (

//                             <div className="table-state">

//                                 <Loader2
//                                     size={30}
//                                     className="spin text-primary"
//                                 />

//                                 <p>
//                                     Loading students...
//                                 </p>

//                             </div>

//                         )}


//                         {/* ERROR */}

//                         {studentsError && (

//                             <div className="state-wrapper">

//                                 <div className="error-alert">

//                                     <UserX size={22} />

//                                     <div>

//                                         <strong>
//                                             Unable to load students
//                                         </strong>

//                                         <p>
//                                             Something went wrong while
//                                             loading the students.
//                                         </p>

//                                         <button
//                                             className="btn btn-sm btn-danger"
//                                             onClick={() =>
//                                                 refetchStudents()
//                                             }
//                                         >

//                                             <RefreshCw
//                                                 size={14}
//                                                 className="me-1"
//                                             />

//                                             Retry

//                                         </button>

//                                     </div>

//                                 </div>

//                             </div>

//                         )}


//                         {/* EMPTY */}

//                         {!studentsLoading &&
//                             !studentsError &&
//                             students.length === 0 && (

//                                 <div className="table-state">

//                                     <div className="empty-icon">
//                                         <Users size={26} />
//                                     </div>

//                                     <h6>
//                                         No students found
//                                     </h6>

//                                     <p>
//                                         There are no active students
//                                         matching the selected class
//                                         and arm.
//                                     </p>

//                                 </div>

//                             )
//                         }


//                         {/* TABLE */}

//                         {!studentsLoading &&
//                             !studentsError &&
//                             students.length > 0 && (

//                                 <>

//                                     <div className="table-responsive">

//                                         <table className="table promotion-table mb-0">

//                                             <thead>

//                                                 <tr>

//                                                     <th className="checkbox-column">

//                                                         <input
//                                                             type="checkbox"
//                                                             className="form-check-input"
//                                                             checked={allSelected}
//                                                             onChange={toggleSelectAll}
//                                                             title="Select all students"
//                                                         />

//                                                     </th>

//                                                     <th>
//                                                         ADMISSION NO.
//                                                     </th>

//                                                     <th>
//                                                         STUDENT
//                                                     </th>

//                                                     <th>
//                                                         GENDER
//                                                     </th>

//                                                     <th>
//                                                         CURRENT ARM
//                                                     </th>

//                                                     <th>
//                                                         DECISION
//                                                     </th>

//                                                 </tr>

//                                             </thead>


//                                             <tbody>

//                                                 {students.map(student => {

//                                                     const action =
//                                                         getStudentAction(
//                                                             student.student_id
//                                                         );

//                                                     const selected =
//                                                         selectedStudents.includes(
//                                                             student.student_id
//                                                         );

//                                                     const initials =
//                                                         (
//                                                             student.first_name?.[0] ||
//                                                             student.surname?.[0] ||
//                                                             "S"
//                                                         ).toUpperCase();


//                                                     return (

//                                                         <tr
//                                                             key={
//                                                                 student.student_id
//                                                             }
//                                                             className={
//                                                                 selected
//                                                                     ? "student-selected"
//                                                                     : ""
//                                                             }
//                                                         >

//                                                             <td>

//                                                                 <input
//                                                                     type="checkbox"
//                                                                     className="form-check-input"
//                                                                     checked={selected}
//                                                                     onChange={() =>
//                                                                         toggleStudent(
//                                                                             student.student_id
//                                                                         )
//                                                                     }
//                                                                 />

//                                                             </td>


//                                                             <td>

//                                                                 <span className="admission-number">
//                                                                     {
//                                                                         student.admission_number
//                                                                     }
//                                                                 </span>

//                                                             </td>


//                                                             <td>

//                                                                 <div className="student-name">

//                                                                     <div className="student-avatar">
//                                                                         {initials}
//                                                                     </div>

//                                                                     <div>

//                                                                         <strong>
//                                                                             {
//                                                                                 student.surname
//                                                                             }{" "}
//                                                                             {
//                                                                                 student.first_name
//                                                                             }{" "}
//                                                                             {
//                                                                                 student.middle_name ||
//                                                                                 ""
//                                                                             }
//                                                                         </strong>

//                                                                     </div>

//                                                                 </div>

//                                                             </td>


//                                                             <td>
//                                                                 <span className="muted-value">
//                                                                     {
//                                                                         student.gender ||
//                                                                         "—"
//                                                                     }
//                                                                 </span>
//                                                             </td>


//                                                             <td>

//                                                                 <span className="arm-badge">
//                                                                     {
//                                                                         student.arm_name ||
//                                                                         "No arm"
//                                                                     }
//                                                                 </span>

//                                                             </td>


//                                                             <td>

//                                                                 {isSS3 ? (

//                                                                     <span className="graduate-badge">

//                                                                         <GraduationCap
//                                                                             size={15}
//                                                                         />

//                                                                         Graduate

//                                                                     </span>

//                                                                 ) : (

//                                                                     <select
//                                                                         className="form-select decision-select"
//                                                                         value={action}
//                                                                         onChange={event =>
//                                                                             changeStudentAction(
//                                                                                 student.student_id,
//                                                                                 event.target.value
//                                                                             )
//                                                                         }
//                                                                     >

//                                                                         <option value="Promoted">
//                                                                             Promote
//                                                                         </option>

//                                                                         <option value="Repeated">
//                                                                             Repeat
//                                                                         </option>

//                                                                     </select>

//                                                                 )}

//                                                             </td>

//                                                         </tr>

//                                                     );

//                                                 })}

//                                             </tbody>

//                                         </table>

//                                     </div>


//                                     {/* ==================================================
//                                         ACTION FOOTER
//                                     ================================================== */}

//                                     <div className="promotion-footer">

//                                         <div>

//                                             <strong>
//                                                 {selectedStudents.length} student(s)
//                                                 selected
//                                             </strong>

//                                             <div className="footer-summary">

//                                                 {isSS3 ? (

//                                                     <>
//                                                         {actionCounts.Graduated}
//                                                         {" "}student(s) will graduate.
//                                                     </>

//                                                 ) : (

//                                                     <>
//                                                         <span className="green-text">
//                                                             {actionCounts.Promoted}
//                                                             {" "}promoted
//                                                         </span>

//                                                         <span>
//                                                             •
//                                                         </span>

//                                                         <span className="orange-text">
//                                                             {actionCounts.Repeated}
//                                                             {" "}repeated
//                                                         </span>
//                                                     </>

//                                                 )}

//                                             </div>

//                                         </div>


//                                         <button
//                                             type="button"
//                                             className="process-button"
//                                             disabled={!canProcess}
//                                             onClick={handlePromotion}
//                                         >

//                                             {promoting ? (

//                                                 <>
//                                                     <Loader2
//                                                         size={17}
//                                                         className="me-2 spin"
//                                                     />

//                                                     Processing...
//                                                 </>

//                                             ) : (

//                                                 <>

//                                                     {isSS3 ? (
//                                                         <GraduationCap
//                                                             size={17}
//                                                             className="me-2"
//                                                         />
//                                                     ) : (
//                                                         <ArrowRight
//                                                             size={17}
//                                                             className="me-2"
//                                                         />
//                                                     )}

//                                                     {
//                                                         isSS3
//                                                             ? "Process Graduation"
//                                                             : "Process Decisions"
//                                                     }

//                                                 </>

//                                             )}

//                                         </button>

//                                     </div>

//                                 </>

//                             )}

//                     </div>

//                 )}


//                 {/* ==================================================
//                     LAST PROCESSED
//                 ================================================== */}

//                 {lastProcessed && (

//                     <div className="content-card success-card">

//                         <div className="card-header">

//                             <div className="success-heading">

//                                 <div className="success-icon">
//                                     <CheckCircle size={21} />
//                                 </div>

//                                 <div>

//                                     <h5>
//                                         Operation Completed
//                                     </h5>

//                                     <p>
//                                         The latest academic progression
//                                         decisions were processed successfully.
//                                     </p>

//                                 </div>

//                             </div>

//                         </div>


//                         <div className="card-body">

//                             <div className="result-grid">

//                                 <div className="result-box promoted-box">

//                                     <span>
//                                         PROMOTED
//                                     </span>

//                                     <strong>
//                                         {
//                                             lastProcessed.summary
//                                                 ?.promoted || 0
//                                         }
//                                     </strong>

//                                 </div>


//                                 <div className="result-box repeated-box">

//                                     <span>
//                                         REPEATED
//                                     </span>

//                                     <strong>
//                                         {
//                                             lastProcessed.summary
//                                                 ?.repeated || 0
//                                         }
//                                     </strong>

//                                 </div>


//                                 <div className="result-box graduated-box">

//                                     <span>
//                                         GRADUATED
//                                     </span>

//                                     <strong>
//                                         {
//                                             lastProcessed.summary
//                                                 ?.graduated || 0
//                                         }
//                                     </strong>

//                                 </div>

//                             </div>

//                         </div>

//                     </div>

//                 )}


//                 {/* ==================================================
//                     NO NEXT SESSION
//                 ================================================== */}

//                 {!setup.nextSession && !isSS3 && (

//                     <div className="warning-card">

//                         <div className="warning-title">
//                             Promotion unavailable
//                         </div>

//                         <p>
//                             There is no next academic session configured.
//                             Configure the next session before processing
//                             promotions.
//                         </p>

//                     </div>

//                 )}

//             </div>


//             {/* ======================================================
//                 PAGE STYLES
//             ====================================================== */}

//             <style>{`

//                 .promotion-page {
//                     min-height: 100vh;
//                     background: #f6f8fb;
//                     padding: 24px 28px 40px;
//                 }

//                 .promotion-container {
//                     width: 100%;
//                     max-width: 1500px;
//                     margin: 0 auto;
//                 }


//                 /* HEADER */

//                 .page-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     gap: 24px;
//                     margin-bottom: 22px;
//                 }

//                 .page-eyebrow {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: #2563eb;
//                     font-size: 12px;
//                     font-weight: 700;
//                     letter-spacing: .05em;
//                     margin-bottom: 6px;
//                 }

//                 .page-header h2 {
//                     margin: 0;
//                     color: #111827;
//                     font-size: 25px;
//                     font-weight: 700;
//                 }

//                 .page-header p {
//                     margin: 5px 0 0;
//                     color: #64748b;
//                     font-size: 14px;
//                 }

//                 .session-box {
//                     display: flex;
//                     align-items: center;
//                     gap: 11px;
//                     background: #fff;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 9px;
//                     padding: 10px 14px;
//                     min-width: 190px;
//                 }

//                 .session-box svg {
//                     color: #2563eb;
//                 }

//                 .session-box div {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 2px;
//                 }

//                 .session-box span {
//                     color: #94a3b8;
//                     font-size: 11px;
//                 }

//                 .session-box strong {
//                     color: #1e293b;
//                     font-size: 13px;
//                 }


//                 /* SUMMARY */

//                 .summary-grid {
//                     display: grid;
//                     grid-template-columns: repeat(3, 1fr);
//                     gap: 14px;
//                     margin-bottom: 18px;
//                 }

//                 .summary-card {
//                     background: #fff;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 10px;
//                     padding: 17px 18px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }

//                 .summary-card span {
//                     display: block;
//                     color: #94a3b8;
//                     font-size: 10px;
//                     font-weight: 700;
//                     letter-spacing: .04em;
//                 }

//                 .summary-card strong {
//                     display: block;
//                     color: #1e293b;
//                     font-size: 20px;
//                     line-height: 1.2;
//                     margin-top: 4px;
//                 }

//                 .summary-card .selected-number {
//                     color: #2563eb;
//                 }

//                 .summary-icon {
//                     width: 40px;
//                     height: 40px;
//                     border-radius: 9px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                 }

//                 .summary-icon.blue {
//                     color: #2563eb;
//                     background: #eff6ff;
//                 }

//                 .summary-icon.green {
//                     color: #16a34a;
//                     background: #f0fdf4;
//                 }

//                 .summary-icon.indigo {
//                     color: #4f46e5;
//                     background: #eef2ff;
//                 }


//                 /* SS3 */

//                 .ss3-notice {
//                     display: flex;
//                     align-items: flex-start;
//                     gap: 12px;
//                     background: #fffbeb;
//                     border: 1px solid #fde68a;
//                     border-radius: 10px;
//                     padding: 13px 15px;
//                     margin-bottom: 18px;
//                 }

//                 .ss3-icon {
//                     width: 38px;
//                     height: 38px;
//                     flex-shrink: 0;
//                     border-radius: 8px;
//                     background: #fef3c7;
//                     color: #b45309;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                 }

//                 .ss3-notice strong {
//                     display: block;
//                     color: #92400e;
//                     font-size: 13px;
//                     margin-bottom: 3px;
//                 }

//                 .ss3-notice p {
//                     margin: 0;
//                     color: #92400e;
//                     font-size: 12px;
//                 }


//                 /* CONTENT CARD */

//                 .content-card {
//                     background: #fff;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 10px;
//                     overflow: hidden;
//                     margin-bottom: 18px;
//                 }

//                 .card-header {
//                     padding: 15px 18px;
//                     border-bottom: 1px solid #eef0f3;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                 }

//                 .card-header h5 {
//                     color: #1e293b;
//                     font-size: 15px;
//                     font-weight: 700;
//                     margin: 0 0 3px;
//                 }

//                 .card-header p {
//                     color: #94a3b8;
//                     font-size: 12px;
//                     margin: 0;
//                 }

//                 .card-body {
//                     padding: 18px;
//                 }


//                 /* FORM */

//                 .form-label {
//                     color: #475569;
//                     font-size: 12px;
//                     font-weight: 600;
//                     margin-bottom: 6px;
//                 }

//                 .form-select {
//                     height: 42px;
//                     border-color: #dfe3e8;
//                     border-radius: 7px;
//                     color: #334155;
//                     font-size: 13px;
//                     box-shadow: none !important;
//                 }

//                 .form-select:focus {
//                     border-color: #93c5fd;
//                 }

//                 .form-select:disabled {
//                     background: #f8fafc;
//                     color: #94a3b8;
//                 }

//                 .graduation-field {
//                     height: 42px;
//                     border-radius: 7px;
//                     border: 1px solid #fde68a;
//                     background: #fffbeb;
//                     color: #92400e;
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 0 12px;
//                     font-size: 13px;
//                     font-weight: 600;
//                 }


//                 /* STUDENT HEADER */

//                 .student-header {
//                     min-height: 68px;
//                 }

//                 .student-badges {
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 6px;
//                     justify-content: flex-end;
//                 }

//                 .count-badge {
//                     padding: 5px 9px;
//                     border-radius: 6px;
//                     font-size: 11px;
//                     font-weight: 600;
//                 }

//                 .count-badge.selected {
//                     background: #eff6ff;
//                     color: #1d4ed8;
//                 }

//                 .count-badge.promoted {
//                     background: #f0fdf4;
//                     color: #15803d;
//                 }

//                 .count-badge.repeated {
//                     background: #fff7ed;
//                     color: #c2410c;
//                 }

//                 .count-badge.graduated {
//                     background: #fffbeb;
//                     color: #a16207;
//                 }


//                 /* TABLE */

//                 .promotion-table {
//                     min-width: 900px;
//                 }

//                 .promotion-table thead th {
//                     background: #f8fafc;
//                     border-bottom: 1px solid #e5e7eb;
//                     color: #64748b;
//                     font-size: 10px;
//                     font-weight: 700;
//                     letter-spacing: .04em;
//                     padding: 12px 14px;
//                     white-space: nowrap;
//                 }

//                 .promotion-table tbody td {
//                     padding: 12px 14px;
//                     border-bottom: 1px solid #f1f5f9;
//                     color: #334155;
//                     font-size: 13px;
//                     vertical-align: middle;
//                 }

//                 .promotion-table tbody tr:last-child td {
//                     border-bottom: none;
//                 }

//                 .promotion-table tbody tr:hover {
//                     background: #fafcff;
//                 }

//                 .promotion-table tbody tr.student-selected {
//                     background: #f7fbff;
//                 }

//                 .promotion-table .checkbox-column {
//                     width: 48px;
//                     padding-left: 18px;
//                 }

//                 .form-check-input {
//                     width: 16px;
//                     height: 16px;
//                     cursor: pointer;
//                 }

//                 .form-check-input:checked {
//                     background-color: #2563eb;
//                     border-color: #2563eb;
//                 }

//                 .admission-number {
//                     color: #475569;
//                     font-size: 12px;
//                     font-weight: 600;
//                     white-space: nowrap;
//                 }

//                 .student-name {
//                     display: flex;
//                     align-items: center;
//                     gap: 10px;
//                     min-width: 210px;
//                 }

//                 .student-avatar {
//                     width: 34px;
//                     height: 34px;
//                     flex-shrink: 0;
//                     border-radius: 50%;
//                     background: #f1f5f9;
//                     color: #475569;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     font-size: 12px;
//                     font-weight: 700;
//                 }

//                 .student-selected .student-avatar {
//                     background: #dbeafe;
//                     color: #1d4ed8;
//                 }

//                 .student-name strong {
//                     color: #1e293b;
//                     font-size: 13px;
//                     font-weight: 600;
//                 }

//                 .muted-value {
//                     color: #64748b;
//                     font-size: 12px;
//                 }

//                 .arm-badge {
//                     display: inline-block;
//                     padding: 4px 8px;
//                     border-radius: 5px;
//                     background: #f1f5f9;
//                     color: #475569;
//                     font-size: 11px;
//                     font-weight: 600;
//                 }

//                 .decision-select {
//                     width: 130px;
//                     height: 34px;
//                     padding-top: 3px;
//                     padding-bottom: 3px;
//                     font-size: 12px;
//                 }

//                 .graduate-badge {
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 6px 9px;
//                     border-radius: 6px;
//                     background: #fffbeb;
//                     border: 1px solid #fde68a;
//                     color: #a16207;
//                     font-size: 11px;
//                     font-weight: 600;
//                 }


//                 /* ACTION FOOTER */

//                 .promotion-footer {
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     gap: 20px;
//                     padding: 14px 18px;
//                     background: #f8fafc;
//                     border-top: 1px solid #e5e7eb;
//                 }

//                 .promotion-footer strong {
//                     display: block;
//                     color: #1e293b;
//                     font-size: 13px;
//                 }

//                 .footer-summary {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     margin-top: 3px;
//                     color: #94a3b8;
//                     font-size: 11px;
//                 }

//                 .green-text {
//                     color: #15803d;
//                 }

//                 .orange-text {
//                     color: #c2410c;
//                 }

//                 .process-button {
//                     height: 40px;
//                     border: none;
//                     border-radius: 7px;
//                     background: #2563eb;
//                     color: #fff;
//                     padding: 0 17px;
//                     font-size: 12px;
//                     font-weight: 600;
//                     display: inline-flex;
//                     align-items: center;
//                     justify-content: center;
//                     white-space: nowrap;
//                 }

//                 .process-button:hover:not(:disabled) {
//                     background: #1d4ed8;
//                 }

//                 .process-button:disabled {
//                     background: #cbd5e1;
//                     cursor: not-allowed;
//                 }


//                 /* STATES */

//                 .table-state {
//                     min-height: 250px;
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     justify-content: center;
//                     color: #64748b;
//                 }

//                 .table-state p {
//                     margin: 10px 0 0;
//                     font-size: 12px;
//                 }

//                 .empty-icon {
//                     width: 52px;
//                     height: 52px;
//                     border-radius: 50%;
//                     background: #f1f5f9;
//                     color: #64748b;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     margin-bottom: 10px;
//                 }

//                 .table-state h6 {
//                     color: #334155;
//                     font-size: 14px;
//                     margin: 0 0 3px;
//                 }

//                 .table-state h6 + p {
//                     margin-top: 0;
//                     color: #94a3b8;
//                 }

//                 .state-wrapper {
//                     padding: 18px;
//                 }

//                 .error-alert {
//                     display: flex;
//                     align-items: flex-start;
//                     gap: 12px;
//                     padding: 14px;
//                     background: #fef2f2;
//                     border: 1px solid #fecaca;
//                     border-radius: 8px;
//                     color: #dc2626;
//                 }

//                 .error-alert strong {
//                     font-size: 13px;
//                 }

//                 .error-alert p {
//                     color: #64748b;
//                     font-size: 12px;
//                     margin: 3px 0 10px;
//                 }


//                 /* SUCCESS */

//                 .success-heading {
//                     display: flex;
//                     align-items: center;
//                     gap: 11px;
//                 }

//                 .success-icon {
//                     width: 38px;
//                     height: 38px;
//                     border-radius: 8px;
//                     background: #f0fdf4;
//                     color: #16a34a;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                 }

//                 .success-heading h5 {
//                     margin: 0 0 3px;
//                     color: #1e293b;
//                     font-size: 15px;
//                 }

//                 .success-heading p {
//                     margin: 0;
//                     color: #94a3b8;
//                     font-size: 12px;
//                 }

//                 .result-grid {
//                     display: grid;
//                     grid-template-columns: repeat(3, 1fr);
//                     gap: 12px;
//                 }

//                 .result-box {
//                     padding: 13px;
//                     border-radius: 8px;
//                 }

//                 .result-box span {
//                     display: block;
//                     font-size: 10px;
//                     font-weight: 700;
//                     color: #64748b;
//                 }

//                 .result-box strong {
//                     display: block;
//                     font-size: 23px;
//                     margin-top: 2px;
//                 }

//                 .promoted-box {
//                     background: #eff6ff;
//                 }

//                 .promoted-box strong {
//                     color: #2563eb;
//                 }

//                 .repeated-box {
//                     background: #fff7ed;
//                 }

//                 .repeated-box strong {
//                     color: #c2410c;
//                 }

//                 .graduated-box {
//                     background: #fffbeb;
//                 }

//                 .graduated-box strong {
//                     color: #a16207;
//                 }


//                 /* WARNING */

//                 .warning-card {
//                     padding: 14px 16px;
//                     border-radius: 9px;
//                     background: #fffbeb;
//                     border: 1px solid #fde68a;
//                 }

//                 .warning-title {
//                     color: #92400e;
//                     font-size: 13px;
//                     font-weight: 700;
//                 }

//                 .warning-card p {
//                     color: #92400e;
//                     font-size: 12px;
//                     margin: 3px 0 0;
//                 }


//                 /* LOADING */

//                 .promotion-loading {
//                     min-height: 60vh;
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     justify-content: center;
//                     text-align: center;
//                 }

//                 .promotion-loading h5 {
//                     color: #1e293b;
//                 }

//                 .promotion-loading p {
//                     font-size: 13px;
//                 }


//                 /* ERROR */

//                 .promotion-error {
//                     max-width: 500px;
//                     margin: 100px auto;
//                     padding: 35px;
//                     background: #fff;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 10px;
//                     text-align: center;
//                 }

//                 .error-icon {
//                     width: 55px;
//                     height: 55px;
//                     margin: 0 auto;
//                     border-radius: 50%;
//                     background: #fef2f2;
//                     color: #dc2626;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                 }


//                 /* ANIMATION */

//                 .spin {
//                     animation: promotion-spin 1s linear infinite;
//                 }

//                 @keyframes promotion-spin {
//                     from {
//                         transform: rotate(0deg);
//                     }

//                     to {
//                         transform: rotate(360deg);
//                     }
//                 }


//                 /* RESPONSIVE */

//                 @media (max-width: 992px) {

//                     .promotion-page {
//                         padding: 20px;
//                     }

//                     .page-header {
//                         align-items: flex-start;
//                         flex-direction: column;
//                     }

//                     .session-box {
//                         width: 100%;
//                     }

//                     .summary-grid {
//                         grid-template-columns: 1fr;
//                     }

//                     .student-header {
//                         align-items: flex-start;
//                         flex-direction: column;
//                         gap: 10px;
//                     }

//                     .student-badges {
//                         justify-content: flex-start;
//                     }

//                 }


//                 @media (max-width: 768px) {

//                     .promotion-page {
//                         padding: 15px;
//                     }

//                     .page-header h2 {
//                         font-size: 22px;
//                     }

//                     .card-body {
//                         padding: 14px;
//                     }

//                     .promotion-footer {
//                         align-items: stretch;
//                         flex-direction: column;
//                     }

//                     .process-button {
//                         width: 100%;
//                     }

//                     .result-grid {
//                         grid-template-columns: 1fr;
//                     }

//                 }

//             `}</style>

//         </div>

//     );

// }


// export default StudentPromotionPage;