import { useEffect, useState } from "react";
import { useStudent } from "../../hooks/useStudent";
import toast from "react-hot-toast";
import { Copy, KeyRound, UserPlus } from "lucide-react";

import api from "@/api/axios";
import Loading from "../common/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";

import StudentHeader from "./profile/StudentHeader";
import PersonalInfoCard from "./profile/PersonalInfoCard";
import AcademicInfoCard from "./profile/AcademicInfoCard";
import AdditionalInfoCard from "./profile/AdditionalInfoCard";
import StudentParentsTab from "./profile/StudentParentsTab";
import StudentResultsTab from "./profile/StudentResultsTab";

import { User, Users, GraduationCap, ClipboardCheck, Wallet } from "lucide-react";

function StudentProfile({ studentId }) {
    const { data: student, isLoading, error } = useStudent(studentId);
    const [account, setAccount] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [accountLoading, setAccountLoading] = useState(true);
    const [accountActionLoading, setAccountActionLoading] = useState(false);

    const loadAccount = async () => {
        setAccountLoading(true);
        try {
            const response = await api.get(`/students/${studentId}/account`);
            setAccount(response.data?.data || null);
        } catch (requestError) {
            if (requestError.response?.status === 404) {
                setAccount(null);
            } else {
                console.error("Failed to load student account", requestError);
            }
        } finally {
            setAccountLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) loadAccount();
    }, [studentId]);

    const createAccount = async () => {
        setAccountActionLoading(true);
        try {
            const response = await api.post(`/students/${studentId}/account`);
            const data = response.data?.data;
            setAccount(data);
            setCredentials({
                username: data.username,
                password: data.temporary_password
            });
            toast.success("Student login account created successfully.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Failed to create student account.");
        } finally {
            setAccountActionLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!account?.id) return;
        if (!window.confirm(`Generate a new temporary password for ${account.username}?`)) return;

        setAccountActionLoading(true);
        try {
            const response = await api.post(`/auth/admin-reset-password/${account.id}`);
            const data = response.data?.data;
            setAccount(data);
            setCredentials({
                username: data.username,
                password: data.temporary_password
            });
            toast.success("New student temporary password generated.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Failed to reset student password.");
        } finally {
            setAccountActionLoading(false);
        }
    };

    const copyCredentials = async () => {
        if (!credentials) return;
        try {
            await navigator.clipboard.writeText(`Username: ${credentials.username}\nTemporary Password: ${credentials.password}`);
            toast.success("Credentials copied.");
        } catch {
            toast.error("Unable to copy credentials.");
        }
    };

    if (isLoading) return <Loading />;

    if (error) {
        return <p className="text-sm text-destructive">Failed to load student.</p>;
    }

    return (
        <div className="space-y-6">
            <StudentHeader student={student} />

            <div className="rounded-xl border bg-background p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">Student Login Account</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage the student's login credentials. Temporary passwords must be changed after first login.
                        </p>
                    </div>

                    {accountLoading ? (
                        <span className="text-sm text-muted-foreground">Checking account...</span>
                    ) : account ? (
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                                Username: {account.username}
                            </span>
                            <Button type="button" variant="outline" disabled={accountActionLoading} onClick={resetPassword}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                            </Button>
                        </div>
                    ) : (
                        <Button type="button" disabled={accountActionLoading} onClick={createAccount}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {accountActionLoading ? "Creating..." : "Create Login Account"}
                        </Button>
                    )}
                </div>

                {account && (
                    <p className="mt-3 text-xs text-slate-500">
                        Password status: {account.must_change_password ? "Temporary password — change required" : "Password has been changed"}
                    </p>
                )}

                {credentials && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="font-semibold text-emerald-950">Login credentials</h3>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    <div className="rounded-md bg-white p-3 text-sm"><span className="block text-xs text-slate-500">Username</span><strong>{credentials.username}</strong></div>
                                    <div className="rounded-md bg-white p-3 text-sm"><span className="block text-xs text-slate-500">Temporary Password</span><strong className="font-mono">{credentials.password}</strong></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={copyCredentials}><Copy className="mr-2 h-4 w-4" />Copy</Button>
                                <Button type="button" variant="outline" onClick={() => setCredentials(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <div className="w-full overflow-x-auto">
                    <TabsList className="flex w-max min-w-full justify-start sm:grid sm:grid-cols-5">
                        <TabsTrigger value="profile" className="shrink-0 whitespace-nowrap px-4"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
                        <TabsTrigger value="parents" className="shrink-0 whitespace-nowrap px-4"><Users className="mr-2 h-4 w-4" />Parents</TabsTrigger>
                        <TabsTrigger value="results" className="shrink-0 whitespace-nowrap px-4"><GraduationCap className="mr-2 h-4 w-4" />Results</TabsTrigger>
                        <TabsTrigger value="attendance" className="shrink-0 whitespace-nowrap px-4"><ClipboardCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
                        <TabsTrigger value="payments" className="shrink-0 whitespace-nowrap px-4"><Wallet className="mr-2 h-4 w-4" />Payments</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <PersonalInfoCard student={student} />
                        <AcademicInfoCard student={student} />
                    </div>
                    <div className="mt-6"><AdditionalInfoCard student={student} /></div>
                </TabsContent>

                <TabsContent value="parents" className="mt-6"><StudentParentsTab studentId={student.id} /></TabsContent>
                <TabsContent value="results" className="mt-6"><StudentResultsTab studentId={student.id} /></TabsContent>
                <TabsContent value="attendance" className="mt-6"><div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Attendance coming soon...</div></TabsContent>
                <TabsContent value="payments" className="mt-6"><div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Payments coming soon...</div></TabsContent>
            </Tabs>
        </div>
    );
}

export default StudentProfile;
