import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addMonths, addDays, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
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

  // --- NEW: Recent Activity ---
  const recentClients = await prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const recentDevis = await prisma.devis.findMany({
    where: { userId, statut: { in: ["ENVOYE", "ACCEPTE"] } },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  const recentFactures = await prisma.facture.findMany({
    where: { userId, statut: { in: ["ENVOYEE", "PAYEE"] } },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  type ActivityItem = {
    type: "client_created" | "devis_sent" | "facture_paid" | "devis_accepted" | "facture_sent";
    label: string;
    date: string;
    link: string;
  };

  const activities: ActivityItem[] = [
    ...recentClients.map((c) => ({
      type: "client_created" as const,
      label: `${c.prenom} ${c.nom}`,
      date: c.createdAt.toISOString(),
      link: "/clients",
    })),
    ...recentDevis.map((d) => ({
      type: (d.statut === "ACCEPTE" ? "devis_accepted" : "devis_sent") as ActivityItem["type"],
      label: `${d.numero} — ${d.client.prenom} ${d.client.nom}`,
      date: d.updatedAt.toISOString(),
      link: `/devis/${d.id}`,
    })),
    ...recentFactures.map((f) => ({
      type: (f.statut === "PAYEE" ? "facture_paid" : "facture_sent") as ActivityItem["type"],
      label: `${f.numero} — ${f.client.prenom} ${f.client.nom}`,
      date: f.updatedAt.toISOString(),
      link: `/factures/${f.id}`,
    })),
  ];
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivity = activities.slice(0, 10);

  // --- NEW: Top Clients ---
  const allFacturesByClient = await prisma.facture.findMany({
    where: { userId, statut: "PAYEE" },
    include: { client: true },
  });
  const clientAggregation: Record<string, { nom: string; montant: number; devisCount: number }> = {};
  for (const f of allFacturesByClient) {
    const key = f.clientId;
    if (!clientAggregation[key]) {
      clientAggregation[key] = {
        nom: `${f.client.prenom} ${f.client.nom}`,
        montant: 0,
        devisCount: 0,
      };
    }
    clientAggregation[key].montant += f.montantTTC;
  }
  const allDevisByClient = await prisma.devis.findMany({
    where: { userId },
    select: { clientId: true },
  });
  for (const d of allDevisByClient) {
    if (clientAggregation[d.clientId]) {
      clientAggregation[d.clientId].devisCount += 1;
    }
  }
  const topClients = Object.values(clientAggregation)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  // --- NEW: Upcoming Deadlines ---
  const in7Days = addDays(now, 7);
  const devisExpiring = await prisma.devis.findMany({
    where: {
      userId,
      statut: "ENVOYE",
      dateValidite: { gte: now, lte: in7Days },
    },
    include: { client: true },
    take: 5,
  });
  const facturesDueSoon = await prisma.facture.findMany({
    where: {
      userId,
      statut: { in: ["ENVOYEE"] },
      dateEcheance: { gte: now, lte: in7Days },
    },
    include: { client: true },
    take: 5,
  });

  const upcomingDeadlines = [
    ...devisExpiring.map((d) => ({
      type: "devis" as const,
      numero: d.numero,
      client: `${d.client.prenom} ${d.client.nom}`,
      date: d.dateValidite?.toISOString() ?? "",
      link: `/devis/${d.id}`,
    })),
    ...facturesDueSoon.map((f) => ({
      type: "facture" as const,
      numero: f.numero,
      client: `${f.client.prenom} ${f.client.nom}`,
      date: f.dateEcheance?.toISOString() ?? "",
      link: `/factures/${f.id}`,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const prenom = session?.user?.name?.split(" ")[0] || "Artisan";

  const userSettings = await prisma.user.findUnique({
    where: { id: userId },
    select: { villeMeteo: true, objectifMensuel: true },
  });

  return (
    <DashboardZypta
      prenom={prenom}
      villeMeteo={userSettings?.villeMeteo ?? "Paris"}
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
      recentActivity={recentActivity}
      topClients={topClients}
      upcomingDeadlines={upcomingDeadlines}
      objectifCA={userSettings?.objectifMensuel ?? 10000}
    />
  );
}
