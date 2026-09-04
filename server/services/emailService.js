const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("SMTP email configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.");
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    return transporter;
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const appName = process.env.APP_NAME || "EDUCORE";

    if (!from) throw new Error("MAIL_FROM or SMTP_USER must be configured.");

    return getTransporter().sendMail({
        from,
        to,
        subject: `${appName} - Reset your password`,
        text: [
            `Hello ${name || "there"},`,
            "",
            `We received a request to reset your ${appName} password.`,
            "",
            `Reset your password using this link: ${resetUrl}`,
            "",
            "This link expires in 30 minutes and can only be used once.",
            "If you did not request this, you can safely ignore this email.",
            "",
            `— ${appName}`,
        ].join("\n"),
        html: `
            <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
                <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
                    <div style="padding:24px 28px;background:#2563eb;color:#ffffff">
                        <h1 style="margin:0;font-size:22px">${appName}</h1>
                    </div>
                    <div style="padding:28px">
                        <h2 style="margin:0 0 12px;font-size:20px">Reset your password</h2>
                        <p style="line-height:1.6">Hello ${name || "there"},</p>
                        <p style="line-height:1.6">We received a request to reset your password. Click the button below to create a new password.</p>
                        <p style="margin:28px 0;text-align:center">
                            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Reset Password</a>
                        </p>
                        <p style="font-size:13px;line-height:1.6;color:#64748b">This link expires in 30 minutes and can only be used once.</p>
                        <p style="font-size:13px;line-height:1.6;color:#64748b">If you did not request a password reset, you can safely ignore this email.</p>
                    </div>
                </div>
            </div>
        `,
    });
}

module.exports = { sendPasswordResetEmail };
