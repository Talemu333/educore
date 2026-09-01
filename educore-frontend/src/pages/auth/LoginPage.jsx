import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../../services/authService";
import ROLES from "../../constants/roles";

function LoginPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const onSubmit = async (data) => {
        try {
            const response = await login(data);
            await loginUser(response.user);

            if (response.user.must_change_password) navigate("/change-password");
            else if (response.user.role_name === ROLES.SUPER_ADMIN) navigate("/settings");
            else if (response.user.role_name === ROLES.PARENT) navigate("/parent-dashboard");
            else navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Login failed.");
        }
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center sm:min-h-[calc(100vh-6rem)]">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8 md:p-10">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-blue-700 sm:text-3xl">EDUCORE</h1>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">School Management System</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5 sm:mt-8">
                        <div>
                            <label htmlFor="login" className="mb-2 block text-sm font-medium text-gray-700">Username or Email</label>
                            <input id="login" type="text" autoComplete="username" {...register("login", { required: "Username or email is required" })} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base" placeholder="Enter username or email" />
                            {errors.login && <p className="mt-1.5 text-xs text-red-500 sm:text-sm">{errors.login.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                            <input id="password" type="password" autoComplete="current-password" {...register("password", { required: "Password is required" })} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base" placeholder="Enter your password" />
                            {errors.password && <p className="mt-1.5 text-xs text-red-500 sm:text-sm">{errors.password.message}</p>}
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm font-medium text-blue-700 hover:underline">Forgot Password?</Link>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base">
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400 sm:mt-8 sm:text-sm">EDUCORE School Management System</div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
