import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("This password reset link is invalid or incomplete.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword(token, password);
            setSuccess(response.message || "Password reset successfully.");
            setTimeout(() => navigate("/"), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "This reset link is invalid or has expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8 md:p-10">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-blue-700 sm:text-3xl">EDUCORE</h1>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">Create a new password</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="mt-7 space-y-5 sm:mt-8">
                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                                <input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base" placeholder="Enter new password" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:text-base" placeholder="Confirm new password" />
                            </div>
                            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                            <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base">
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    ) : (
                        <div className="mt-8 rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">{success}<br />Redirecting to login...</div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link to="/" className="font-medium text-blue-700 hover:underline">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
