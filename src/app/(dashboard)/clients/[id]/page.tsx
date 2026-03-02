import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      devis: { orderBy: { createdAt: "desc" } },
      factures: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  return (
    <ClientDetailContent
      client={{
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        adresseChantier: client.adresseChantier,
        notes: client.notes,
        statutPipeline: client.statutPipeline,
        devis: client.devis.map((d) => ({
          id: d.id,
          numero: d.numero,
          montantTTC: d.montantTTC,
          statut: d.statut,
        })),
        factures: client.factures.map((f) => ({
          id: f.id,
          numero: f.numero,
          montantTTC: f.montantTTC,
          statut: f.statut,
        })),
      }}
    />
  );
}
