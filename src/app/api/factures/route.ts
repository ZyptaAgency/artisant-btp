import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getNextFactureNumber } from "@/lib/facture";
import { z } from "zod";
import { UniteMesure } from "@prisma/client";

const ligneSchema = z.object({
  description: z.string().min(1),
  quantite: z.number().positive(),
  unite: z.nativeEnum(UniteMesure),
  prixUnitaire: z.number().min(0),
  tauxTVA: z.number().refine((v) => v === 10 || v === 20),
});

const createFactureSchema = z.object({
  clientId: z.string(),
  devisId: z.string().optional(),
  dateEcheance: z.string().optional(),
  acompte: z.number().min(0).optional(),
  lignes: z.array(ligneSchema).min(1),
});

function calcMontantHT(ligne: { quantite: number; prixUnitaire: number }) {
  return ligne.quantite * ligne.prixUnitaire;
}

function calcTVA(montantHT: number, taux: number) {
  return montantHT * (taux / 100);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const factures = await prisma.facture.findMany({
    where: { userId: session.user.id },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(factures);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createFactureSchema.parse(body);

    const lignesAvecMontant = data.lignes.map((l) => {
      const montantHT = calcMontantHT(l);
      return { ...l, montantHT };
    });

    const montantHT = lignesAvecMontant.reduce((s, l) => s + l.montantHT, 0);
    const tva = lignesAvecMontant.reduce(
      (s, l) => s + calcTVA(l.montantHT, l.tauxTVA),
      0
    );
    const montantTTC = montantHT + tva;

    const numero = await getNextFactureNumber();

    const facture = await prisma.facture.create({
      data: {
        numero,
        clientId: data.clientId,
        devisId: data.devisId ?? null,
        montantHT,
        tva,
        montantTTC,
        statut: "BROUILLON",
        dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : null,
        acompte: data.acompte ?? 0,
        userId: session.user.id,
      },
    });

    for (const l of lignesAvecMontant) {
      await prisma.ligneFacture.create({
        data: {
          description: l.description,
          quantite: l.quantite,
          unite: l.unite,
          prixUnitaire: l.prixUnitaire,
          tauxTVA: l.tauxTVA,
          montantHT: l.montantHT,
          factureId: facture.id,
        },
      });
    }

    const result = await prisma.facture.findUnique({
      where: { id: facture.id },
      include: { client: true, lignes: true },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
