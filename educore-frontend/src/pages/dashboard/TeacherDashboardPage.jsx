import { useEffect, useMemo, useState } from "react";
import { getMyAssignments } from "../../api/teacherAssignmentApi";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function TeacherDashboardPage() {

    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getMyAssignments();

                

                setDashboard(data);

            } catch (err) {

                

                setError(
                    err.response?.data?.message ||
                    "Unable to load teacher dashboard."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);


    const assignments =
        dashboard?.assignments || [];


    const subjects = useMemo(() => {

        return new Set(
            assignments.map(
                assignment =>
                    assignment.subject_id
            )
        ).size;

    }, [assignments]);


    const classes = useMemo(() => {

        return new Set(
            assignments.map(
                assignment =>
                    assignment.class_id
            )
        ).size;

    }, [assignments]);


    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-gray-500">
                    Loading teacher dashboard...
                </div>

            </div>
        );

    }


    if (error) {

        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                <h2 className="font-semibold text-red-700">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

            </div>
        );

    }


    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Teacher Dashboard
                </h1>

                <p className="mt-1 text-gray-500">

                    Welcome back,{" "}

                    <span className="font-semibold text-gray-700">
                        {dashboard?.teacher?.full_name || "Teacher"}
                    </span>

                </p>

            </div>


            {/* TEACHER PROFILE */}

            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <p className="text-sm text-blue-100">
                            Welcome back
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">

                            {dashboard?.teacher?.full_name ||
                                "Teacher"}

                        </h2>

                        <p className="mt-2 text-sm text-blue-100">

                            Staff Number:{" "}

                            <span className="font-semibold">

                                {dashboard?.teacher?.staff_number ||
                                    "Not available"}

                            </span>

                        </p>

                    </div>


                    <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur">

                        <p className="text-xs uppercase tracking-wide text-blue-100">
                            Teaching Assignments
                        </p>

                        <p className="mt-1 text-3xl font-bold">

                            {dashboard?.totalAssignments || 0}

                        </p>

                    </div>

                </div>

            </div>


            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">


                {/* ASSIGNMENTS */}

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Assignments
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">

                                {dashboard?.totalAssignments ||
                                    0}

                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                            📚
                        </div>

                    </div>

                </div>


                {/* SUBJECTS */}

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Subjects
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {subjects}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
                            📝
                        </div>

                    </div>

                </div>


                {/* CLASSES */}

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Classes
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {classes}
                            </p>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl">
                            🏫
                        </div>

                    </div>

                </div>

            </div>


            {/* ASSIGNMENTS */}

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

                <div className="border-b border-gray-100 px-6 py-5">

                    <h2 className="text-lg font-semibold text-gray-800">
                        My Teaching Assignments
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Classes and subjects assigned to you.
                    </p>

                </div>


                {assignments.length === 0 ? (

                    <div className="px-6 py-10 text-center">

                        <div className="text-4xl">
                            📚
                        </div>

                        <p className="mt-3 text-gray-500">
                            You currently have no teaching assignments.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">

                                <tr>

                                    <th className="px-6 py-4">
                                        Subject
                                    </th>

                                    <th className="px-6 py-4">
                                        Class
                                    </th>

                                    <th className="px-6 py-4">
                                        Arm
                                    </th>

                                    <th className="px-6 py-4">
                                        Term
                                    </th>

                                    <th className="px-6 py-4">
                                        Session
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {assignments.map(
                                    assignment => (

                                        <tr
                                            key={assignment.id}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4">

                                                <span className="font-medium text-gray-800">

                                                    {
                                                        assignment.subject_name
                                                    }

                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.class_name
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.arm_name ||
                                                    "All Arms"
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.term_name
                                                }

                                            </td>


                                            <td className="px-6 py-4 text-gray-600">

                                                {
                                                    assignment.session_name
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* QUICK ACTIONS */}

            {/* QUICK ACTIONS */}

            <div>

                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* TAKE ATTENDANCE */}

                    <button
                        type="button"
                        onClick={() => navigate("/attendance")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            📋
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            Take Attendance
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Record attendance for your assigned classes.
                        </p>

                    </button>


                    {/* ENTER RESULTS */}

                    <button
                        type="button"
                        onClick={() => navigate("/results")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            📊
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            Enter Results
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter and manage students' academic results.
                        </p>

                    </button>


                    {/* MY STUDENTS */}

                    <button
                        type="button"
                        onClick={() => navigate("/teacher-students")}
                        className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="text-2xl">
                            👨‍🎓
                        </div>

                        <h3 className="mt-3 font-semibold text-gray-800">
                            My Students
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            View students in your assigned classes.
                        </p>

                    </button>

                </div>

            </div>

        </div>

    );

}

export default TeacherDashboardPage;