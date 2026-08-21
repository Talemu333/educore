const dashboardModel = require("../models/dashboardModel");

const getDashboard = async () => {

    // ============================================
    // CURRENT SESSION & TERM
    // ============================================

    const [
        session,
        term
    ] = await Promise.all([

        dashboardModel.getCurrentSession(),

        dashboardModel.getCurrentTerm()

    ]);


    // ============================================
    // GET DASHBOARD DATA
    // ============================================

    const [
        students,
        activeStudents,
        teachers,
        parents,
        classes,
        genderDistribution,
        classPopulation,
        recentStudents,
        todayAttendance,
        topStudents,
        expectedFees,
        totalPayments,
        studentsWithPayments,
        recentPayments,
        recentAnnouncements
    ] = await Promise.all([

        dashboardModel.getStudentCount(),

        dashboardModel.getActiveStudentCount(),

        dashboardModel.getTeacherCount(),

        dashboardModel.getParentCount(),

        dashboardModel.getClassCount(),

        dashboardModel.getGenderDistribution(),

        dashboardModel.getClassPopulation(),

        dashboardModel.getRecentStudents(),

        dashboardModel.getTodayAttendance(),

        dashboardModel.getTopStudents(),

        dashboardModel.getExpectedFees(
            session?.id,
            term?.id
        ),

        dashboardModel.getTotalPayments(
            session?.id,
            term?.id
        ),

        dashboardModel.getStudentsWithPayments(
            session?.id,
            term?.id
        ),

        dashboardModel.getRecentPayments(),

        dashboardModel.getRecentAnnouncements()

    ]);


    // ============================================
    // ATTENDANCE
    // ============================================

    const attendanceTotal =
        Number(
            todayAttendance?.total || 0
        );

    const attendancePresent =
        Number(
            todayAttendance?.present || 0
        );

    const attendanceAbsent =
        Number(
            todayAttendance?.absent || 0
        );

    const attendanceLate =
        Number(
            todayAttendance?.late || 0
        );


    const attendanceToday =
        attendanceTotal === 0
            ? 0
            : Number(
                (
                    attendancePresent /
                    attendanceTotal *
                    100
                ).toFixed(2)
            );


    // ============================================
    // FINANCE
    // ============================================

    const outstandingFees =
        Math.max(
            Number(expectedFees) -
            Number(totalPayments),
            0
        );


    // ============================================
    // RETURN DASHBOARD
    // ============================================

    return {

        // ----------------------------------------
        // OVERVIEW
        // ----------------------------------------

        students,

        active_students:
            activeStudents,

        teachers,

        parents,

        classes,


        // ----------------------------------------
        // CURRENT ACADEMIC PERIOD
        // ----------------------------------------

        current_session:
            session?.session_name || null,

        current_session_id:
            session?.id || null,

        current_term:
            term?.term_name || null,

        current_term_id:
            term?.id || null,


        // ----------------------------------------
        // ATTENDANCE
        // ----------------------------------------

        attendance_today:
            attendanceToday,

        attendance_total:
            attendanceTotal,

        attendance_present:
            attendancePresent,

        attendance_absent:
            attendanceAbsent,

        attendance_late:
            attendanceLate,


        // ----------------------------------------
        // FINANCE
        // ----------------------------------------

        expected_fees:
            Number(expectedFees),

        total_payments:
            Number(totalPayments),

        outstanding_fees:
            outstandingFees,

        students_with_payments:
            studentsWithPayments,


        // ----------------------------------------
        // CHART DATA
        // ----------------------------------------

        gender_distribution:
            genderDistribution,

        class_population:
            classPopulation,


        // ----------------------------------------
        // RECENT ACTIVITY
        // ----------------------------------------

        recent_students:
            recentStudents,

        recent_payments:
            recentPayments,

        recent_announcements:
            recentAnnouncements,


        // ----------------------------------------
        // PERFORMANCE
        // ----------------------------------------

        top_students:
            topStudents

    };

};


module.exports = {
    getDashboard
};