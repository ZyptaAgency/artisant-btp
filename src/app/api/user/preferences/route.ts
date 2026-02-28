import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true, documentStyle: true, identifiantType: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    theme: user.theme ?? "supernova",
    documentStyle: user.documentStyle ?? "MODERNE",
    identifiantType: user.identifiantType ?? "SIRET",
  });
}

const schema = z.object({
  documentStyle: z.enum(["MODERNE", "CLASSIQUE", "EPURE"]).optional(),
  identifiantType: z.enum(["SIRET", "BCE"]).optional(),
  theme: z.enum(["supernova", "noir", "blanc", "systeme"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.documentStyle && { documentStyle: data.documentStyle }),
        ...(data.identifiantType && { identifiantType: data.identifiantType }),
        ...(data.theme && { theme: data.theme }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
