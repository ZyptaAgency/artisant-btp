import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const ALLOWED_EMAILS: string[] = ["demo@artisan-btp.fr", "business@zypta.be"];
const DEFAULT_PASSWORD = "demo1234";

/**
 * Réinitialise le mot de passe d'un compte autorisé à "demo1234".
 * Protégé par RESET_DEMO_SECRET.
 * Usage: GET /api/auth/reset-demo?secret=XXX
 *        GET /api/auth/reset-demo?secret=XXX&email=business@zypta.be
 */
export async function GET(req: Request) {
  const secret = process.env.RESET_DEMO_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Non configuré" }, { status: 404 });
  }

  const url = new URL(req.url);
  const fromUrl = url.searchParams.get("secret")?.trim() ?? "";
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const provided = (fromUrl || fromHeader).trim();
  if (provided !== secret.trim()) {
    return NextResponse.json({ error: "Secret invalide" }, { status: 403 });
  }

  const emailParam = url.searchParams.get("email")?.trim().toLowerCase();
  const email = emailParam && ALLOWED_EMAILS.includes(emailParam) ? emailParam : "demo@artisan-btp.fr";

  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    if (email === "demo@artisan-btp.fr") {
      await prisma.user.upsert({
        where: { email: "demo@artisan-btp.fr" },
        update: { password: hashedPassword },
        create: {
          nom: "Jean Dupont",
          entreprise: "Dupont BTP",
          siret: "12345678901234",
          email: "demo@artisan-btp.fr",
          telephone: "06 12 34 56 78",
          adresse: "12 rue des Artisans, 75001 Paris",
          password: hashedPassword,
        },
      });
    } else {
      const updated = await prisma.user.updateMany({
        where: { email },
        data: { password: hashedPassword },
      });
      if (updated.count === 0) {
        return NextResponse.json({ error: `Compte ${email} introuvable. Inscrivez-vous d'abord.` }, { status: 404 });
      }
    }

    return NextResponse.json({
      ok: true,
      message: `${email} : mot de passe réinitialisé à ${DEFAULT_PASSWORD}`,
    });
  } catch (err) {
    console.error("[RESET-DEMO]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
