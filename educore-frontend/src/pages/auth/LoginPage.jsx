import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../../services/authService";
import ROLES from "../../constants/roles";
import { useSchoolSettings } from "../../hooks/useSchoolSettings";

function LoginPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const { data: schoolSettings, isLoading: isSchoolLoading } = useSchoolSettings();

    const schoolName = schoolSettings?.school_name || "EduProw";
    const schoolLogo = schoolSettings?.school_logo;
    const isSchoolPortal = Boolean(schoolSettings?.school_name);

    const onSubmit = async (data) => {
        try {
            const response = await login(data);
            await loginUser(response.user);
            if (response.user.must_change_password) navigate("/change-password");
            else if (response.user.role_name === ROLES.SUPER_ADMIN) navigate("/settings");
            else if (response.user.role_name === ROLES.PARENT) navigate("/parent-dashboard");
            else if (response.user.role_name === ROLES.TEACHER) navigate("/teacher-dashboard");
            else if (response.user.role_name === ROLES.STUDENT) navigate("/student-dashboard");
            else navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Login failed.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <div className="relative flex min-h-[240px] w-full flex-col justify-between overflow-hidden bg-blue-700 px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:w-[46%] lg:px-14 lg:py-12">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10" />
                    <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-blue-500/40" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            {schoolLogo ? (
                                <img
                                    src={schoolLogo}
                                    alt={`${schoolName} logo`}
                                    className="h-14 w-14 rounded-xl bg-white object-contain p-1.5 shadow-sm"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                                    {schoolName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-100">
                                    {isSchoolPortal ? "School Portal" : "EduProw"}
                                </p>
                                <h1 className="mt-1 text-lg font-bold leading-tight sm:text-xl">
                                    {isSchoolLoading ? "Loading school..." : schoolName}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10 max-w-xl lg:mt-0">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
                            School Management System
                        </p>
                        <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                            Everything your school needs, in one place.
                        </h2>
                        <p className="mt-5 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
                            Access your school dashboard, manage academic activities, and stay connected with your school community.
                        </p>
                    </div>

                    <p className="relative z-10 mt-8 text-xs text-blue-100 lg:mt-0">
                        Powered by EduProw
                    </p>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 lg:mb-10">
                            <p className="text-sm font-medium text-blue-700">Welcome back</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Sign in to your account
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                                Enter your login details to continue to your school portal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label htmlFor="login" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Username or Email
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    autoComplete="username"
                                    {...register("login", { required: "Username or email is required" })}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base"
                                    placeholder="Enter username or email"
                                />
                                {errors.login && <p className="mt-1.5 text-xs text-red-500 sm:text-sm">{errors.login.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register("password", { required: "Password is required" })}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:text-base"
                                    placeholder="Enter your password"
                                />
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 sm:text-sm">{errors.password.message}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                            >
                                {isSubmitting ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
                            {isSchoolPortal ? `${schoolName} • Powered by EduProw` : "EduProw School Management System"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
