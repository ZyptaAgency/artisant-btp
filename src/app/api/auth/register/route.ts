import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const maxDuration = 60;

const registerSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  entreprise: z.string().min(2, "Entreprise requise"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

async function parseBody(req: Request): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return req.json();
  }
  const formData = await req.formData();
  return Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""])
  ) as Record<string, string>;
}

export async function POST(req: Request) {
  const isJson = req.headers.get("content-type")?.includes("application/json") ?? false;
  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    const body = await parseBody(req);
    const parsed = registerSchema.parse(body);
    const email = parsed.email.trim().toLowerCase();
    const { nom, entreprise, password } = parsed;

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existing) {
      if (isJson) {
        return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 400 });
      }
      return NextResponse.redirect(
        `${baseUrl}/register?error=email_exists&email=${encodeURIComponent(email)}`,
        303
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const ADMIN_EMAIL = "business@zypta.be";
    const trialEndsAt = email === ADMIN_EMAIL ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const planStatus = email === ADMIN_EMAIL ? "paid" : "trial";

    await prisma.user.create({
      data: {
        nom,
        entreprise,
        email,
        password: hashedPassword,
        trialEndsAt,
        planStatus,
      },
    });

    if (isJson) {
      return NextResponse.json({ redirect: `${baseUrl}/login?registered=1&email=${encodeURIComponent(email)}` });
    }
    return NextResponse.redirect(
      `${baseUrl}/login?registered=1&email=${encodeURIComponent(email)}`,
      303
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.issues[0]?.message ?? "Données invalides";
      if (isJson) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      return NextResponse.redirect(
        `${baseUrl}/register?error=${encodeURIComponent(msg)}`,
        303
      );
    }
    console.error("Register error:", error);
    if (isJson) {
      return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }
    return NextResponse.redirect(
      `${baseUrl}/register?error=Erreur+lors+de+l'inscription`,
      303
    );
  }
}
