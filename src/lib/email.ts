import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? "Zypta BTP <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn("[EMAIL] RESEND_API_KEY non configurée - email non envoyé");
    return { data: null, error: { message: "RESEND_API_KEY non configurée" } };
  }

  return client.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}
