import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { subDays, format, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const period = Number(req.nextUrl.searchParams.get("period") ?? "180");
  const since = subDays(new Date(), period);

  const months = eachMonthOfInterval({ start: since, end: new Date() });

  // --- CA Évolution: paid invoices grouped by month ---
  const paidInvoices = await prisma.facture.findMany({
    where: { userId, statut: "PAYEE", createdAt: { gte: since } },
    select: { createdAt: true, montantTTC: true },
  });

  const caEvolution = months.map((m) => {
    const key = format(m, "yyyy-MM");
    const total = paidInvoices
      .filter((f) => format(f.createdAt, "yyyy-MM") === key)
      .reduce((sum, f) => sum + f.montantTTC, 0);
    return { date: key, label: format(m, "MMM yyyy", { locale: fr }), montant: total };
  });

  // --- Devis vs Factures: count per month ---
  const [allDevis, allFactures] = await Promise.all([
    prisma.devis.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.facture.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const devisVsFactures = months.map((m) => {
    const key = format(m, "yyyy-MM");
    return {
      mois: format(m, "MMM", { locale: fr }),
      devis: allDevis.filter((d) => format(d.createdAt, "yyyy-MM") === key).length,
      factures: allFactures.filter((f) => format(f.createdAt, "yyyy-MM") === key).length,
    };
  });

  // --- Répartition des statuts pipeline ---
  const clientsByStatus = await prisma.client.groupBy({
    by: ["statutPipeline"],
    where: { userId },
    _count: { id: true },
  });

  const repartitionStatuts = clientsByStatus.map((g) => ({
    statut: g.statutPipeline,
    count: g._count.id,
  }));

  // --- Taux de conversion mensuel ---
  const devisForConversion = await prisma.devis.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { createdAt: true, statut: true },
  });

  const tauxConversion = months.map((m) => {
    const key = format(m, "yyyy-MM");
    const monthDevis = devisForConversion.filter(
      (d) => format(d.createdAt, "yyyy-MM") === key
    );
    const envoyes = monthDevis.filter((d) =>
      ["ENVOYE", "ACCEPTE", "REFUSE", "EXPIRE"].includes(d.statut)
    ).length;
    const acceptes = monthDevis.filter((d) => d.statut === "ACCEPTE").length;
    const taux = envoyes > 0 ? (acceptes / envoyes) * 100 : 0;
    return {
      date: key,
      label: format(m, "MMM", { locale: fr }),
      taux: Math.round(taux * 10) / 10,
    };
  });

  return NextResponse.json({
    caEvolution,
    devisVsFactures,
    repartitionStatuts,
    tauxConversion,
  });
}
