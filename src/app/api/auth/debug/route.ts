import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Route de diagnostic : vérifie la connexion DB et les variables d'environnement */
export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // 1. Variables d'environnement
  checks.NEXTAUTH_URL = {
    ok: !!process.env.NEXTAUTH_URL,
    detail: process.env.NEXTAUTH_URL || "manquant",
  };
  checks.NEXTAUTH_SECRET = {
    ok: !!process.env.NEXTAUTH_SECRET,
    detail: process.env.NEXTAUTH_SECRET ? "défini" : "manquant",
  };
  checks.DATABASE_URL = {
    ok: !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL ? "défini" : "manquant",
  };

  // 2. Connexion DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = { ok: true, detail: "connexion OK" };
  } catch (err) {
    checks.db = {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }

  // 3. Utilisateur demo existe ?
  try {
    const demo = await prisma.user.findFirst({
      where: { email: "demo@artisan-btp.fr" },
      select: { id: true, email: true },
    });
    checks.demoUser = {
      ok: !!demo,
      detail: demo ? "existe" : "absent (lancer: npx prisma db seed)",
    };
  } catch {
    checks.demoUser = { ok: false, detail: "erreur requête" };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 503 });
}
