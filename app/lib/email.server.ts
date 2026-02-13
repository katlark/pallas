import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  if (!resendApiKey || !emailFrom) {
    console.warn(
      "Password reset email not sent: RESEND_API_KEY or EMAIL_FROM is missing",
    );
    return;
  }

  console.log(resendApiKey, emailFrom);

  const resend = new Resend(resendApiKey);

  const res = await resend.emails.send({
    from: emailFrom,
    to,
    subject: "Reset your Cards password",
    text: [
      "You requested a password reset for your Cards account.",
      "",
      `Reset link: ${resetUrl}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });
  console.log("RES", res);
}
