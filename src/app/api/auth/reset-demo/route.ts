import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Réinitialise le mot de passe du compte démo à "demo1234".
 * Protégé par RESET_DEMO_SECRET (à définir dans Vercel pour la prod).
 * Usage: GET /api/auth/reset-demo?secret=VOTRE_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.RESET_DEMO_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Non configuré" }, { status: 404 });
  }

  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Secret invalide" }, { status: 403 });
  }

  try {
    const hashedPassword = await bcrypt.hash("demo1234", 12);
    const user = await prisma.user.upsert({
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

    return NextResponse.json({
      ok: true,
      message: user ? "Compte démo créé/réinitialisé : demo@artisan-btp.fr / demo1234" : "Mot de passe réinitialisé : demo@artisan-btp.fr / demo1234",
    });
  } catch (err) {
    console.error("[RESET-DEMO]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
