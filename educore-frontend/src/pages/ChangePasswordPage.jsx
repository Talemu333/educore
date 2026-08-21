import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { changePassword } from "@/services/authService";


function ChangePasswordPage() {

    const navigate = useNavigate();

    const [
        currentPassword,
        setCurrentPassword
    ] = useState("");

    const [
        newPassword,
        setNewPassword
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!currentPassword) {

            toast.error(
                "Please enter your current password."
            );

            return;

        }


        if (!newPassword) {

            toast.error(
                "Please enter your new password."
            );

            return;

        }


        if (newPassword.length < 8) {

            toast.error(
                "New password must be at least 8 characters long."
            );

            return;

        }


        if (newPassword !== confirmPassword) {

            toast.error(
                "New passwords do not match."
            );

            return;

        }


        try {

            setIsSubmitting(true);


            await changePassword({

                current_password:
                    currentPassword,

                new_password:
                    newPassword

            });


            toast.success(
                "Password changed successfully."
            );


            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");


            navigate(-1);


        } catch (error) {

            toast.error(

                error.response
                    ?.data
                    ?.message ||

                "Failed to change password."

            );

        } finally {

            setIsSubmitting(false);

        }

    };


    return (

        <div className="max-w-2xl space-y-6">

            {/* PAGE HEADER */}

            <div>

                <h1 className="text-2xl font-bold">

                    Change Password

                </h1>

                <p className="mt-1 text-sm text-muted-foreground">

                    Update your account password.

                </p>

            </div>


            {/* FORM */}

            <div className="rounded-xl border bg-background p-6 shadow-sm">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* CURRENT PASSWORD */}

                    <div>

                        <label
                            htmlFor="current-password"
                            className="text-sm font-medium"
                        >

                            Current Password

                        </label>

                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="current-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Enter current password"
                        />

                    </div>


                    {/* NEW PASSWORD */}

                    <div>

                        <label
                            htmlFor="new-password"
                            className="text-sm font-medium"
                        >

                            New Password

                        </label>

                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="new-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Enter new password"
                        />

                        <p className="mt-1 text-xs text-muted-foreground">

                            Password must contain at least 8 characters.

                        </p>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div>

                        <label
                            htmlFor="confirm-password"
                            className="text-sm font-medium"
                        >

                            Confirm New Password

                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="new-password"
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Confirm new password"
                        />

                    </div>


                    {/* BUTTON */}

                    <div className="flex justify-end">

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >

                            {isSubmitting
                                ? "Changing Password..."
                                : "Change Password"
                            }

                        </Button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default ChangePasswordPage;