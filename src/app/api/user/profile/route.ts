import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  nom: z.string().min(1),
  entreprise: z.string().min(1),
  activite: z.string().optional(),
  siret: z.string().optional(),
  identifiantType: z.enum(["SIRET", "BCE"]).optional(),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  villeMeteo: z.string().optional(),
  logo: z.string().optional(),
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
        nom: data.nom,
        entreprise: data.entreprise,
        activite: data.activite ?? null,
        siret: data.siret ?? null,
        email: data.email,
        telephone: data.telephone ?? null,
        adresse: data.adresse ?? null,
        villeMeteo: data.villeMeteo ?? null,
        logo: data.logo ?? null,
        identifiantType: data.identifiantType ?? null,
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
