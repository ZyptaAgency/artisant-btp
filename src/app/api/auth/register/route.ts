import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const maxDuration = 60;
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  entreprise: z.string().min(2, "Entreprise requise"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Doit contenir un caractère spécial"),
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
  try {
    const body = await parseBody(req);
    const { nom, entreprise, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.redirect(
        new URL(`/register?error=email_exists&email=${encodeURIComponent(email)}`, req.url)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        nom,
        entreprise,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.redirect(
      new URL(`/login?registered=1&email=${encodeURIComponent(email)}`, req.url)
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.issues[0]?.message ?? "Données invalides";
      return NextResponse.redirect(
        new URL(`/register?error=${encodeURIComponent(msg)}`, req.url)
      );
    }
    console.error("Register error:", error);
    return NextResponse.redirect(
      new URL("/register?error=Erreur+lors+de+l'inscription", req.url)
    );
  }
}
