import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { useSchoolTheme } from "../../context/SchoolThemeContext";
import { useSchoolSettings } from "../../hooks/useSchoolSettings";

function ForgotPasswordPage() {
    const { theme } = useSchoolTheme();
    const { data: schoolSettings } = useSchoolSettings();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email.trim());
            setMessage(response.message || "If an account exists for that email, password reset instructions have been generated.");

            if (import.meta.env.DEV && response.resetUrl) {
                setMessage(`${response.message || "Reset link generated."} Development reset link: ${response.resetUrl}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to process the request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="school-auth-page min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8 md:p-10">
                    <div className="text-center">
                        <div className="mb-5 flex justify-center">{schoolSettings?.school_logo ? <img src={schoolSettings.school_logo} alt={`${schoolSettings?.school_name || "School"} logo`} className="h-16 w-16 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-slate-200" /> : <div className="school-auth-logo">{(schoolSettings?.school_name || "EduProw").slice(0, 2).toUpperCase()}</div>}</div><h1 className="school-brand-text text-2xl font-bold sm:text-3xl">{schoolSettings?.school_name || "EduProw"}</h1>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">Reset your password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5 sm:mt-8">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--school-primary)] focus:ring-2 focus:ring-[var(--school-primary-light)] sm:text-base"
                                placeholder="Enter your email address"
                            />
                        </div>

                        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                        {message && <p className="break-words rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="school-primary-button flex min-h-12 w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                        >
                            {loading ? "Processing..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link to="/" className="school-brand-text font-medium hover:underline">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
