const passport = require("passport");
const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");

const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ success: false, message: info.message });
        req.logIn(user, async (err) => {
            if (err) return next(err);
            try { await authModel.updateLastLogin(user.id); } catch (error) { console.error("Failed to update last login:", error); }
            return res.json({ success: true, message: "Login successful.", user: {
                id: user.id, username: user.username, email: user.email,
                role_name: user.role_name, must_change_password: user.must_change_password,
                school_id: user.school_id, admin_type: user.admin_type
            }});
        });
    })(req, res, next);
};

const logout = (req, res) => {
    req.logout(() => res.json({ success: true, message: "Logged out successfully." }));
};

const getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: "Not authenticated." });
    res.json({ success: true, user: req.user });
};

const changePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password) return res.status(400).json({ success: false, message: "Current password is required." });
        if (!new_password) return res.status(400).json({ success: false, message: "New password is required." });
        if (new_password.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
        const user = await authModel.findUser(req.user.username);
        if (!user) return res.status(404).json({ success: false, message: "User account not found." });
        if (!(await bcrypt.compare(current_password, user.password))) return res.status(401).json({ success: false, message: "Current password is incorrect." });
        if (await bcrypt.compare(new_password, user.password)) return res.status(400).json({ success: false, message: "New password must be different from your current password." });
        await authModel.updatePassword(req.user.id, await bcrypt.hash(new_password, 10));
        res.json({ success: true, message: "Password changed successfully." });
    } catch (error) { next(error); }
};

const requestPasswordReset = async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim();
        if (!email) return res.status(400).json({ success: false, message: "Email is required." });

        const generic = "If an account exists for that email, a password reset link has been sent.";
        const user = await authModel.findUserByEmail(email);
        if (!user || user.is_active === false) return res.json({ success: true, message: generic });

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiryMinutes = Math.max(5, Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES || 30));
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
        await authModel.savePasswordResetToken(user.id, tokenHash, expiresAt);

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
        const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

        try {
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl,
                username: user.username,
            });
            console.log(`Password reset email sent to ${user.email}.`);
        } catch (emailError) {
            // Keep the response generic so the endpoint cannot be used to
            // discover whether an email address belongs to a user account.
            console.error("Password reset email could not be sent:", emailError);
        }

        // Keep returning the link locally when an email provider is not configured.
        // Never expose the reset token in production.
        const payload = { success: true, message: generic };
        if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
            payload.reset_url = resetUrl;
        }
        res.json(payload);
    } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, new_password } = req.body;
        if (!token) return res.status(400).json({ success: false, message: "Reset token is required." });
        if (!new_password) return res.status(400).json({ success: false, message: "New password is required." });
        if (new_password.length < 8) return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
        const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
        const user = await authModel.findUserByResetTokenHash(tokenHash);
        if (!user || user.is_active === false) return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
        await authModel.resetPassword(user.id, await bcrypt.hash(new_password, 10));
        res.json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) { next(error); }
};

module.exports = { login, logout, getCurrentUser, changePassword, requestPasswordReset, resetPassword };
