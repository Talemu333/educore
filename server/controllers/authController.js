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
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await authModel.savePasswordResetToken(user.id, tokenHash, expiresAt);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

        // Send the email when either Resend or SMTP is configured.
        const emailConfigured = Boolean(
            process.env.RESEND_API_KEY ||
            (
                process.env.SMTP_HOST &&
                process.env.SMTP_USER &&
                process.env.SMTP_PASS
            )
        );

        if (emailConfigured) {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.username,
                resetUrl,
            });
        } else {
            console.log(`Password reset email not sent because no email provider is configured. Reset link for ${email}: ${resetUrl}`);
        }

        const payload = { success: true, message: generic };
        // Keep the reset URL visible only outside production for local testing.
        if (process.env.NODE_ENV !== "production") payload.reset_url = resetUrl;
        res.json(payload);
    } catch (error) {
        console.error("Password reset email error:", error);
        next(error);
    }
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
