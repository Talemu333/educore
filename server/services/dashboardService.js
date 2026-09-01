const dashboardModel = require("../models/dashboardModel");
const expenseModel = require("../models/expenseModel");

const getDashboard = async (schoolId) => {
    if (!schoolId) {
        throw new Error("School context is required to load the dashboard.");
    }

    const [session, term] = await Promise.all([
        dashboardModel.getCurrentSession(schoolId),
        dashboardModel.getCurrentTerm(schoolId)
    ]);

    const [students, activeStudents, teachers, parents, classes,
        genderDistribution, classPopulation, recentStudents,
        todayAttendance, topStudents, expectedFees, totalPayments,
        studentsWithPayments, recentPayments, recentAnnouncements,
        expenseSummary, recentExpenses, expenseCategories] = await Promise.all([
        dashboardModel.getStudentCount(schoolId),
        dashboardModel.getActiveStudentCount(schoolId),
        dashboardModel.getTeacherCount(schoolId),
        dashboardModel.getParentCount(schoolId),
        dashboardModel.getClassCount(schoolId),
        dashboardModel.getGenderDistribution(schoolId),
        dashboardModel.getClassPopulation(schoolId),
        dashboardModel.getRecentStudents(schoolId),
        dashboardModel.getTodayAttendance(schoolId),
        dashboardModel.getTopStudents(schoolId),
        dashboardModel.getExpectedFees(schoolId, session?.id, term?.id),
        dashboardModel.getTotalPayments(schoolId, session?.id, term?.id),
        dashboardModel.getStudentsWithPayments(schoolId, session?.id, term?.id),
        dashboardModel.getRecentPayments(schoolId),
        dashboardModel.getRecentAnnouncements(schoolId),
        expenseModel.getExpenseSummary(schoolId),
        expenseModel.getRecentExpenses(schoolId),
        expenseModel.getCategorySummary(schoolId)
    ]);

    const attendanceTotal = Number(todayAttendance?.total || 0);
    const attendancePresent = Number(todayAttendance?.present || 0);
    const attendanceAbsent = Number(todayAttendance?.absent || 0);
    const attendanceLate = Number(todayAttendance?.late || 0);
    const attendanceToday = attendanceTotal === 0
        ? 0
        : Number((attendancePresent / attendanceTotal * 100).toFixed(2));

    const outstandingFees = Math.max(
        Number(expectedFees) - Number(totalPayments), 0
    );

    return {
        students,
        active_students: activeStudents,
        teachers,
        parents,
        classes,
        current_session: session?.session_name || null,
        current_session_id: session?.id || null,
        current_term: term?.term_name || null,
        current_term_id: term?.id || null,
        attendance_today: attendanceToday,
        attendance_total: attendanceTotal,
        attendance_present: attendancePresent,
        attendance_absent: attendanceAbsent,
        attendance_late: attendanceLate,
        expected_fees: Number(expectedFees),
        total_payments: Number(totalPayments),
        outstanding_fees: outstandingFees,
        students_with_payments: studentsWithPayments,
        gender_distribution: genderDistribution,
        class_population: classPopulation,
        recent_students: recentStudents,
        recent_payments: recentPayments,
        recent_announcements: recentAnnouncements,
        top_students: topStudents,
        expenses: {
            total_count: Number(expenseSummary?.total_count || 0),
            total_amount: Number(expenseSummary?.total_amount || 0),
            monthly_amount: Number(expenseSummary?.monthly_amount || 0),
            yearly_amount: Number(expenseSummary?.yearly_amount || 0),
            recent: recentExpenses,
            by_category: expenseCategories
        }
    };
};

module.exports = { getDashboard };
