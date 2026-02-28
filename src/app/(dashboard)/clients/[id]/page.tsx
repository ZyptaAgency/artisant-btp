import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Receipt } from "lucide-react";

const STATUT_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTE: "Contacté",
  DEVIS_ENVOYE: "Devis envoyé",
  NEGOCIATION: "Négociation",
  SIGNE: "Signé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  PERDU: "Perdu",
};

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {client.prenom} {client.nom}
          </h1>
          <p className="text-slate-600">
            {STATUT_LABELS[client.statutPipeline] ?? client.statutPipeline}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${client.email}`} className="text-[#2563EB] hover:underline">
                {client.email}
              </a>
            </div>
            {client.telephone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${client.telephone}`} className="text-slate-700">
                  {client.telephone}
                </a>
              </div>
            )}
            {client.adresseChantier && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="text-slate-700">{client.adresseChantier}</span>
              </div>
            )}
            {client.notes && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-600">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Devis ({client.devis.length})
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/devis/nouveau?clientId=${client.id}`}>Nouveau devis</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.devis.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun devis</p>
              ) : (
                <ul className="space-y-2">
                  {client.devis.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/devis/${d.id}`}
                        className="flex justify-between text-sm hover:text-[#2563EB]"
                      >
                        <span>{d.numero}</span>
                        <span>{formatCurrency(d.montantTTC)} - {d.statut}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Factures ({client.factures.length})
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/factures/nouvelle?clientId=${client.id}`}>Nouvelle facture</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.factures.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune facture</p>
              ) : (
                <ul className="space-y-2">
                  {client.factures.slice(0, 5).map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/factures/${f.id}`}
                        className="flex justify-between text-sm hover:text-[#2563EB]"
                      >
                        <span>{f.numero}</span>
                        <span>{formatCurrency(f.montantTTC)} - {f.statut}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
