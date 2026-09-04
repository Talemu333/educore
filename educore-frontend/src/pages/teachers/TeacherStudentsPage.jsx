import { useEffect, useMemo, useState } from "react";
import { Search, Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyStudents } from "../../api/teacherAssignmentApi";
import Pagination from "@/components/common/Pagination";

function TeacherStudentsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("ALL");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setLoading(true);
                setError("");
                const result = await getMyStudents();
                setData(result);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load your students."
                );
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, []);

    const students = data?.students || [];

    const classes = useMemo(() => {
        const uniqueClasses = new Map();
        students.forEach(student => {
            if (!uniqueClasses.has(student.class_id)) {
                uniqueClasses.set(student.class_id, student.class_name);
            }
        });
        return Array.from(uniqueClasses.entries());
    }, [students]);

    const filteredStudents = useMemo(() => {
        const searchValue = search.trim().toLowerCase();
        return students.filter(student => {
            const matchesSearch =
                !searchValue ||
                student.student_name.toLowerCase().includes(searchValue) ||
                student.admission_number?.toLowerCase().includes(searchValue);
            const matchesClass =
                selectedClass === "ALL" ||
                String(student.class_id) === String(selectedClass);
            return matchesSearch && matchesClass;
        });
    }, [students, search, selectedClass]);

    useEffect(() => {
        setPage(1);
    }, [search, selectedClass]);

    const total = filteredStudents.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredStudents.slice(start, start + limit);
    }, [filteredStudents, page, limit]);

    const handleLimitChange = event => {
        setLimit(Number(event.target.value));
        setPage(1);
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-gray-500">Loading your students...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-700">Unable to load students</h2>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">My Students</h1>
                <p className="mt-1 text-gray-500">View students in your assigned classes.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="mt-2 text-3xl font-bold text-gray-800">{data?.totalStudents || 0}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">Assigned Classes</p>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{classes.length}</p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm text-gray-500">Showing</p>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{total}</p>
                </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or admission number..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">All Classes</option>
                        {classes.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Students</h2>
                        <p className="mt-1 text-sm text-gray-500">Students assigned to your teaching classes.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="hidden whitespace-nowrap sm:inline">Rows per page</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>

                {total === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-4 font-medium text-gray-700">No students found</p>
                        <p className="mt-1 text-sm text-gray-500">Try changing your search or class filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Admission No.</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Arm</th>
                                    <th className="px-6 py-4">Subject(s)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedStudents.map((student, index) => (
                                    <tr
                                        key={`${student.id}-${student.class_id}-${student.arm_id}-${student.session_id}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500">{(page - 1) * limit + index + 1}</td>
                                        <td className="px-6 py-4"><span className="font-medium text-gray-700">{student.admission_number}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{student.student_name}</div>
                                            <div className="text-xs text-gray-500">{student.gender}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{student.class_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.arm_name || "All Arms"}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.subjects}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

export default TeacherStudentsPage;
