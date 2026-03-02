import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }

    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (password.length < 8 || !specialCharRegex.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères et 1 caractère spécial" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        emailToken: token,
        emailTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailToken: null,
        emailTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
