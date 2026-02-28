import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addMonths, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { DashboardZypta } from "@/components/dashboard/DashboardZypta";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // CA du mois
  const facturesPayees = await prisma.facture.findMany({
    where: {
      userId,
      statut: "PAYEE",
      createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
    },
  });
  const caMois = facturesPayees.reduce((sum, f) => sum + f.montantTTC, 0);

  // CA mois précédent
  const facturesLastMonth = await prisma.facture.findMany({
    where: {
      userId,
      statut: "PAYEE",
      createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
  });
  const caMoisPrecedent = facturesLastMonth.reduce((sum, f) => sum + f.montantTTC, 0);
  const evolutionCA = caMoisPrecedent > 0 ? ((caMois - caMoisPrecedent) / caMoisPrecedent) * 100 : 0;

  // Devis en attente
  const devisEnAttente = await prisma.devis.count({
    where: { userId, statut: "ENVOYE" },
  });

  // Factures impayées + en retard > 30j
  const facturesImpayees = await prisma.facture.findMany({
    where: {
      userId,
      statut: { in: ["ENVOYEE", "EN_RETARD"] },
    },
    include: { client: true },
  });
  const facturesRetard30 = facturesImpayees.filter(
    (f) => f.dateEcheance && differenceInDays(now, f.dateEcheance) > 30
  );

  // Taux de conversion
  const devisAcceptes = await prisma.devis.count({
    where: { userId, statut: "ACCEPTE" },
  });
  const devisEnvoyes = await prisma.devis.count({
    where: { userId, statut: { in: ["ENVOYE", "ACCEPTE", "REFUSE", "EXPIRE"] } },
  });
  const tauxConversion = devisEnvoyes > 0 ? (devisAcceptes / devisEnvoyes) * 100 : 0;

  // Chantiers pour timeline
  const chantiers = await prisma.chantier.findMany({
    where: { client: { userId } },
    include: { client: true },
    orderBy: { dateDebut: "asc" },
  });

  // Actions urgentes
  const devisARelancer = await prisma.devis.findMany({
    where: {
      userId,
      statut: "ENVOYE",
      dateValidite: { lt: addMonths(now, 1) },
    },
    include: { client: true },
    take: 5,
  });
  const facturesAEnvoyer = await prisma.facture.findMany({
    where: {
      userId,
      statut: "BROUILLON",
    },
    include: { client: true },
    take: 3,
  });

  const prenom = session?.user?.name?.split(" ")[0] || "Artisan";

  return (
    <DashboardZypta
      prenom={prenom}
      caMois={caMois}
      evolutionCA={evolutionCA}
      devisEnAttente={devisEnAttente}
      facturesImpayees={facturesImpayees.length}
      facturesRetard30={facturesRetard30.length}
      tauxConversion={tauxConversion}
      chantiers={chantiers.map((c) => ({
        id: c.id,
        nom: `${c.client.prenom} ${c.client.nom}`,
        statut: c.statut,
        dateDebut: c.dateDebut?.toISOString() ?? null,
        dateFin: c.dateFin?.toISOString() ?? null,
        avancement: 0,
      }))}
      devisARelancer={devisARelancer.map((d) => ({
        id: d.id,
        numero: d.numero,
        client: `${d.client.prenom} ${d.client.nom}`,
        dateValidite: d.dateValidite?.toISOString() ?? null,
      }))}
      facturesEnRetard={facturesImpayees.slice(0, 5).map((f) => ({
        id: f.id,
        numero: f.numero,
        client: `${f.client.prenom} ${f.client.nom}`,
        dateEcheance: f.dateEcheance?.toISOString() ?? null,
        retardJours: f.dateEcheance ? differenceInDays(now, f.dateEcheance) : 0,
      }))}
      facturesAEnvoyer={facturesAEnvoyer.map((f) => ({
        id: f.id,
        numero: f.numero,
        client: `${f.client.prenom} ${f.client.nom}`,
      }))}
    />
  );
}
