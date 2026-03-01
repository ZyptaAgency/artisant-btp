import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/settings?email_error=Token manquant", req.url)
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        emailToken: token,
        emailTokenExpiry: { gt: new Date() },
      },
    });

    if (!user || !user.pendingEmail) {
      return NextResponse.redirect(
        new URL("/settings?email_error=Lien invalide ou expiré", req.url)
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailToken: null,
        emailTokenExpiry: null,
      },
    });

    return NextResponse.redirect(
      new URL("/settings?email_success=Email mis à jour avec succès", req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings?email_error=Erreur serveur", req.url)
    );
  }
}
