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
    const result = await prisma.user.updateMany({
      where: { email: "demo@artisan-btp.fr" },
      data: { password: hashedPassword },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Utilisateur démo introuvable. Lancez le seed." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Mot de passe réinitialisé : demo@artisan-btp.fr / demo1234" });
  } catch (err) {
    console.error("[RESET-DEMO]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
