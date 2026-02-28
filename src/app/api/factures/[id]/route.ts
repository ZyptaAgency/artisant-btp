import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { StatutFacture, UniteMesure } from "@prisma/client";

const updateSchema = z.object({
  statut: z.nativeEnum(StatutFacture).optional(),
  dateEcheance: z.string().optional(),
  acompte: z.number().optional(),
  lignes: z.array(z.object({
    description: z.string().min(1),
    quantite: z.number().min(0.01),
    unite: z.nativeEnum(UniteMesure),
    prixUnitaire: z.number().min(0),
    tauxTVA: z.number(),
  })).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const facture = await prisma.facture.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, lignes: true, devis: true },
  });

  if (!facture) {
    return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
  }

  return NextResponse.json(facture);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.facture.findFirst({
    where: { id, userId: session.user.id },
    include: { lignes: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.lignes && existing.statut !== "BROUILLON") {
      return NextResponse.json({ error: "Seules les factures brouillon peuvent être modifiées" }, { status: 400 });
    }

    if (data.lignes) {
      const montantHT = data.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
      const tva = data.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (l.tauxTVA / 100), 0);
      const montantTTC = montantHT + tva;
      const acompte = data.acompte ?? existing.acompte;

      await prisma.ligneFacture.deleteMany({ where: { factureId: id } });

      const facture = await prisma.facture.update({
        where: { id },
        data: {
          montantHT,
          tva,
          montantTTC,
          acompte,
          dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : existing.dateEcheance,
          lignes: {
            create: data.lignes.map((l) => ({
              description: l.description,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaire: l.prixUnitaire,
              tauxTVA: l.tauxTVA,
              montantHT: l.quantite * l.prixUnitaire,
            })),
          },
        },
        include: { client: true, lignes: true },
      });

      return NextResponse.json(facture);
    }

    const facture = await prisma.facture.update({
      where: { id },
      data: { statut: data.statut },
      include: { client: true, lignes: true },
    });

    return NextResponse.json(facture);
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
