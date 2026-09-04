const RESEND_API_URL = "https://api.resend.com/emails";

const requiredEnv = (name) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not configured.`);
    return value;
};

const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendPasswordResetEmail = async ({ to, resetUrl, username }) => {
    const apiKey = requiredEnv("RESEND_API_KEY");
    const from = requiredEnv("MAIL_FROM");
    const appName = process.env.APP_NAME || "EDUCORE";
    const expiryMinutes = process.env.PASSWORD_RESET_EXPIRY_MINUTES || "30";

    const safeName = escapeHtml(username || "there");
    const safeAppName = escapeHtml(appName);
    const safeResetUrl = escapeHtml(resetUrl);

    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: `Reset your ${appName} password`,
            text: [
                `Hello ${username || "there"},`,
                "",
                `We received a request to reset your ${appName} password.`,
                `Use this link to choose a new password: ${resetUrl}`,
                "",
                `This link expires in ${expiryMinutes} minutes and can only be used once.`,
                "",
                `If you did not request this, you can safely ignore this email.`,
                "",
                `— ${appName}`,
            ].join("\n"),
            html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <div style="font-size:22px;font-weight:700;color:#1d4ed8;margin-bottom:24px;">${safeAppName}</div>
      <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px;">Reset your password</h1>
      <p style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 20px;">Hello ${safeName}, we received a request to reset your password.</p>
      <p style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 24px;">Click the button below to choose a new password.</p>
      <p style="margin:0 0 24px;"><a href="${safeResetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;">Reset Password</a></p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 10px;">This link expires in ${escapeHtml(expiryMinutes)} minutes and can only be used once.</p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">If you did not request this password reset, you can safely ignore this email.</p>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:20px 0 0;">This is an automated message from ${safeAppName}.</p>
  </div>
</body>
</html>`,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Password reset email failed (${response.status}): ${body}`);
    }

    return response.json();
};

module.exports = { sendPasswordResetEmail };
