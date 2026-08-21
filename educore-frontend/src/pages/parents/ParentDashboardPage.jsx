import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    Users,
    UserRound,
    ClipboardCheck,
    FileText,
    ArrowRight
} from "lucide-react";

import { getParentDashboard } from "@/api/parentApi";

function ParentDashboardPage() {

    const navigate = useNavigate();

    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["parent-dashboard"],
        queryFn: getParentDashboard
    });

    if (isLoading) {

        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-gray-500">
                    Loading your dashboard...
                </p>
            </div>
        );

    }

    if (isError) {

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">

                <h2 className="text-lg font-semibold text-red-700">
                    Unable to load parent dashboard
                </h2>

                <p className="text-red-600 mt-2">
                    {error?.response?.data?.message ||
                        "Something went wrong."}
                </p>

            </div>
        );

    }

    const parent = data?.parent;
    const children = data?.children || [];

    return (

        <div className="space-y-8">

            {/* Header */}

            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Parent Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                    Welcome back, {parent?.first_name}.
                    Here's an overview of your children's
                    information.
                </p>

            </div>


            {/* Summary Cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white rounded-xl shadow-sm border p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                My Children
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                {children.length}
                            </p>

                        </div>

                        <div className="bg-blue-100 p-3 rounded-full">

                            <Users
                                className="text-blue-700"
                                size={28}
                            />

                        </div>

                    </div>

                </div>


                <div className="bg-white rounded-xl shadow-sm border p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Active Children
                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                {children.length}
                            </p>

                        </div>

                        <div className="bg-green-100 p-3 rounded-full">

                            <UserRound
                                className="text-green-700"
                                size={28}
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* Parent Information */}

            <div className="bg-white rounded-xl shadow-sm border p-6">

                <div className="flex items-center gap-3 mb-6">

                    <div className="bg-blue-100 p-2 rounded-lg">

                        <UserRound
                            className="text-blue-700"
                            size={22}
                        />

                    </div>

                    <h2 className="text-xl font-semibold text-gray-800">
                        My Information
                    </h2>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <div>

                        <p className="text-sm text-gray-500">
                            Full Name
                        </p>

                        <p className="font-medium text-gray-800 mt-1">

                            {parent?.surname}{" "}

                            {parent?.first_name}{" "}

                            {parent?.middle_name || ""}

                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-gray-500">
                            Gender
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                            {parent?.gender || "Not provided"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-gray-500">
                            Phone Number
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                            {parent?.phone_number || "Not provided"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-gray-500">
                            Email
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                            {parent?.email || "Not provided"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-gray-500">
                            Occupation
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                            {parent?.occupation || "Not provided"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-gray-500">
                            Residential Address
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                            {parent?.residential_address ||
                                "Not provided"}
                        </p>

                    </div>

                </div>

            </div>


            {/* Children */}

            <div>

                <div className="flex items-center justify-between mb-4">

                    <div>

                        <h2 className="text-xl font-semibold text-gray-800">
                            My Children
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            View your children's academic information.
                        </p>

                    </div>

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">

                        {children.length}{" "}

                        {children.length === 1
                            ? "Child"
                            : "Children"}

                    </span>

                </div>


                {children.length === 0 ? (

                    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">

                        <Users
                            className="mx-auto text-gray-400"
                            size={40}
                        />

                        <p className="text-gray-500 mt-3">
                            No active children found.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {children.map((child) => (

                            <div
                                key={`${child.id}-${child.session_id}`}
                                className="bg-white rounded-xl shadow-sm border p-6"
                            >

                                {/* Child name */}

                                <div className="flex items-start justify-between">

                                    <div>

                                        <h3 className="text-lg font-semibold text-gray-800">

                                            {child.student_name}

                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">

                                            {child.admission_number}

                                        </p>

                                    </div>

                                    <div className="bg-blue-100 p-2 rounded-lg">

                                        <GraduationIcon />

                                    </div>

                                </div>


                                {/* Academic information */}

                                <div className="grid grid-cols-2 gap-4 mt-6">

                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500">
                                            Class
                                        </p>

                                        <p className="font-medium text-gray-800 mt-1">

                                            {child.class_name ||
                                                "Not assigned"}

                                        </p>

                                    </div>


                                    <div className="bg-gray-50 rounded-lg p-3">

                                        <p className="text-xs text-gray-500">
                                            Arm
                                        </p>

                                        <p className="font-medium text-gray-800 mt-1">

                                            {child.arm_name ||
                                                "Not assigned"}

                                        </p>

                                    </div>

                                </div>


                                {/* Actions */}

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/parent-results?studentId=${child.id}`
                                            )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2.5 font-medium transition"
                                    >

                                        <FileText size={18} />

                                        View Results

                                        <ArrowRight size={16} />

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/parent-attendance?studentId=${child.id}`
                                            )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2.5 font-medium transition"
                                    >

                                        <ClipboardCheck size={18} />

                                        Attendance

                                        <ArrowRight size={16} />

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}


/*
    Small reusable icon component.
*/

function GraduationIcon() {

    return (

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-700"
        >

            <path d="M22 10 12 5 2 10l10 5 10-5Z" />

            <path d="M6 12v5c3 2 9 2 12 0v-5" />

            <path d="M22 10v6" />

        </svg>

    );

}

export default ParentDashboardPage;