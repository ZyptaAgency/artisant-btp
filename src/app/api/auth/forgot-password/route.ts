import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailToken: token,
          emailTokenExpiry: expiry,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      const result = await sendEmail({
        to: email,
        subject: "Réinitialisation de votre mot de passe — Zypta BTP",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
        <tr><td style="padding:40px 36px 0;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Zypta BTP</h1>
          <div style="width:40px;height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;margin-bottom:32px;"></div>
        </td></tr>
        <tr><td style="padding:0 36px;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#e2e2e8;">Réinitialisation de mot de passe</h2>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9898a6;">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 32px;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
            Réinitialiser mon mot de passe
          </a>
        </td></tr>
        <tr><td style="padding:0 36px 36px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#6b6b78;">
            Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (result?.error) {
        console.error("[forgot-password] sendEmail:", result.error.message);
      }
    }

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
