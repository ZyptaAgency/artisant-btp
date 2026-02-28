import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getNextFactureNumber } from "@/lib/facture";

export async function POST(
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

  if (devis.statut !== "ACCEPTE") {
    return NextResponse.json(
      { error: "Seuls les devis acceptés peuvent être convertis en facture" },
      { status: 400 }
    );
  }

  const numero = await getNextFactureNumber();

  const facture = await prisma.facture.create({
    data: {
      numero,
      devisId: devis.id,
      clientId: devis.clientId,
      montantHT: devis.montantHT,
      tva: devis.tva,
      montantTTC: devis.montantTTC,
      statut: "BROUILLON",
      dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      acompte: 0,
      userId: session.user.id,
    },
  });

  for (const l of devis.lignes) {
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
}
