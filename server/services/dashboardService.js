const dashboardModel = require("../models/dashboardModel");
const ApiError = require("../utils/ApiError");

const getDashboard = async () => {

    const [
        students,
        teachers,
        classes,
        session,
        term,
        genderDistribution,
        classPopulation,
        recentStudents,
        todayAttendance,
        topStudents
    ] = await Promise.all([
        dashboardModel.getStudentCount(),
        dashboardModel.getTeacherCount(),
        dashboardModel.getClassCount(),
        dashboardModel.getCurrentSession(),
        dashboardModel.getCurrentTerm(),
        dashboardModel.getGenderDistribution(),
        dashboardModel.getClassPopulation(),
        dashboardModel.getRecentStudents(),
        dashboardModel.getTodayAttendance(),
        dashboardModel.getTopStudents()
    ]);

    const total = Number(todayAttendance.total || 0);

    const present = Number(todayAttendance.present || 0);

    const attendanceToday =
        total === 0
            ? 0
            : Number(((present / total) * 100).toFixed(2));

    return {

        students,

        teachers,

        classes,

        current_session: session?.session_name || null,

        current_term: term?.term_name || null,

        attendance_today: attendanceToday,

        gender_distribution: genderDistribution,

        class_population: classPopulation,

        recent_students: recentStudents,

        top_students: topStudents

    };

};

module.exports = {
    getDashboard
}