import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { changePassword, changeUsername } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

function ChangePasswordPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUsernamePassword, setCurrentUsernamePassword] = useState("");
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [isChangingUsername, setIsChangingUsername] = useState(false);
    const isProprietor = user?.role_name?.toLowerCase() === "admin" &&
        user?.admin_type?.toLowerCase().replace(/\s+/g, "_") === "proprietor";

    const handleUsernameSubmit = async (event) => {
        event.preventDefault();
        const normalizedUsername = newUsername.trim();
        if (!currentUsernamePassword) {
            toast.error("Enter your current password to confirm this change.");
            return;
        }
        if (!/^[a-zA-Z0-9._-]{4,30}$/.test(normalizedUsername)) {
            toast.error("Username must be 4–30 characters and use only letters, numbers, dots, underscores or hyphens.");
            return;
        }
        if (normalizedUsername.toLowerCase() === String(user?.username || "").toLowerCase()) {
            toast.error("Enter a username different from your current one.");
            return;
        }
        try {
            setIsChangingUsername(true);
            await changeUsername({ current_password: currentUsernamePassword, new_username: normalizedUsername });
            toast.success("Username updated. Reloading your account...");
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change username.");
        } finally {
            setIsChangingUsername(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentPassword) {
            toast.error("Please enter your current password.");
            return;
        }

        if (!newPassword) {
            toast.error("Please enter your new password.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            setIsSubmitting(true);

            await changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });

            toast.success("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            if (user?.role_name === "Student") {
                navigate("/student-dashboard", { replace: true });
            } else if (user?.role_name === "Parent") {
                navigate("/parent-dashboard", { replace: true });
            } else if (user?.role_name === "Teacher") {
                navigate("/teacher-dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Change Password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Update your account password.</p>
            </div>

            {isProprietor && (
                <div className="rounded-xl border bg-background p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Change Username</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the username assigned when your school was created. Your password and school data will remain unchanged.
                    </p>
                    <form onSubmit={handleUsernameSubmit} className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="current-username" className="text-sm font-medium">Current Username</label>
                            <input id="current-username" value={user?.username || ""} readOnly className="mt-1 w-full rounded-md border bg-muted px-3 py-2 text-muted-foreground" />
                        </div>
                        <div>
                            <label htmlFor="new-username" className="text-sm font-medium">New Username</label>
                            <input id="new-username" type="text" value={newUsername} onChange={(event) => setNewUsername(event.target.value)} autoComplete="username" maxLength={30} required className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Enter a username you will remember" />
                            <p className="mt-1 text-xs text-muted-foreground">Use 4–30 letters, numbers, dots, underscores or hyphens. It must be unique within your school.</p>
                        </div>
                        <div>
                            <label htmlFor="username-current-password" className="text-sm font-medium">Confirm with Current Password</label>
                            <input id="username-current-password" type="password" value={currentUsernamePassword} onChange={(event) => setCurrentUsernamePassword(event.target.value)} autoComplete="current-password" required className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Enter your current password" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isChangingUsername}>{isChangingUsername ? "Updating Username..." : "Change Username"}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-xl border bg-background p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            autoComplete="current-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            autoComplete="new-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Enter new password"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Password must contain at least 8 characters.</p>
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            autoComplete="new-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Changing Password..." : "Change Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordPage;
