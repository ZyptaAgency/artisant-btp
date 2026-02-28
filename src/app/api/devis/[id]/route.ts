import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { StatutDevis, UniteMesure } from "@prisma/client";

const ligneSchema = z.object({
  description: z.string().min(1),
  quantite: z.number().positive(),
  unite: z.nativeEnum(UniteMesure),
  prixUnitaire: z.number().min(0),
  tauxTVA: z.number().refine((v) => v === 10 || v === 20),
});

const updateDevisSchema = z.object({
  dateValidite: z.string().optional(),
  notes: z.string().optional(),
  statut: z.nativeEnum(StatutDevis).optional(),
  lignes: z.array(ligneSchema).min(1).optional(),
});

function calcMontantHT(ligne: { quantite: number; prixUnitaire: number }) {
  return ligne.quantite * ligne.prixUnitaire;
}

function calcTVA(montantHT: number, taux: number) {
  return montantHT * (taux / 100);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const devis = await prisma.devis.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, lignes: true },
  });

  if (!devis) {
    return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
  }

  return NextResponse.json(devis);
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
  const existing = await prisma.devis.findFirst({
    where: { id, userId: session.user.id },
    include: { lignes: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateDevisSchema.parse(body);

    let montantHT = existing.montantHT;
    let tva = existing.tva;
    let montantTTC = existing.montantTTC;

    if (data.lignes) {
      const lignesAvecMontant = data.lignes.map((l) => {
        const mHT = l.quantite * l.prixUnitaire;
        return { ...l, montantHT: mHT };
      });
      montantHT = lignesAvecMontant.reduce((s, l) => s + l.montantHT, 0);
      tva = lignesAvecMontant.reduce(
        (s, l) => s + calcTVA(l.montantHT, l.tauxTVA),
        0
      );
      montantTTC = montantHT + tva;

      await prisma.ligneDevis.deleteMany({ where: { devisId: id } });
      await prisma.ligneDevis.createMany({
        data: lignesAvecMontant.map((l) => ({
          description: l.description,
          quantite: l.quantite,
          unite: l.unite,
          prixUnitaire: l.prixUnitaire,
          tauxTVA: l.tauxTVA,
          montantHT: l.montantHT,
          devisId: id,
        })),
      });
    }

    const devis = await prisma.devis.update({
      where: { id },
      data: {
        ...(data.dateValidite !== undefined && {
          dateValidite: data.dateValidite ? new Date(data.dateValidite) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.statut !== undefined && { statut: data.statut }),
        ...(data.lignes && { montantHT, tva, montantTTC }),
      },
      include: { client: true, lignes: true },
    });

    return NextResponse.json(devis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
