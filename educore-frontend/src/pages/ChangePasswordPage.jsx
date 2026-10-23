import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { changePassword, updateProfileImage } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

function ChangePasswordPage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_image_url || "");
    const [isSavingProfileImage, setIsSavingProfileImage] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleProfileImageSubmit = async (event) => {
        event.preventDefault();
        const cleanedUrl = profileImageUrl.trim();
        if (cleanedUrl) {
            try {
                const parsedUrl = new URL(cleanedUrl);
                if (parsedUrl.protocol !== "https:") throw new Error("https");
            } catch {
                toast.error("Enter a valid HTTPS image URL from Cloudinary.");
                return;
            }
        }
        try {
            setIsSavingProfileImage(true);
            const response = await updateProfileImage(cleanedUrl);
            setUser?.({ ...user, profile_image_url: response.profile_image_url || null });
            setProfileImageUrl(response.profile_image_url || "");
            toast.success("Profile picture link updated.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile picture link.");
        } finally {
            setIsSavingProfileImage(false);
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

            <div className="rounded-xl border bg-background p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Profile Picture</h2>
                <p className="mt-1 text-sm text-muted-foreground">Paste a secure Cloudinary image URL. EduProw stores only the link, not the image file.</p>
                <form onSubmit={handleProfileImageSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="profile-image-url" className="text-sm font-medium">Profile picture URL</label>
                        <input id="profile-image-url" type="url" value={profileImageUrl} onChange={(event) => setProfileImageUrl(event.target.value)} placeholder="https://res.cloudinary.com/..." className="mt-1 w-full rounded-md border px-3 py-2" />
                    </div>
                    {profileImageUrl.trim() && <img src={profileImageUrl.trim()} alt="Profile picture preview" className="h-20 w-20 rounded-full border object-cover" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSavingProfileImage}>
                            {isSavingProfileImage ? "Saving..." : "Save Profile Picture"}
                        </Button>
                    </div>
                </form>
            </div>

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
