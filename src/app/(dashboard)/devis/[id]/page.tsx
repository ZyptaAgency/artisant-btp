import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { DevisActions } from "@/components/forms/DevisActions";

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
  EXPIRE: "Expiré",
};

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const devis = await prisma.devis.findFirst({
    where: { id, userId },
    include: { client: true, lignes: true },
  });

  if (!devis) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/devis">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{devis.numero}</h1>
            <p className="text-slate-600">
              {devis.client.prenom} {devis.client.nom} - {STATUT_LABELS[devis.statut] ?? devis.statut}
            </p>
          </div>
        </div>
        <DevisActions
          devis={devis}
          client={devis.client}
          artisan={user ? { nom: user.nom, entreprise: user.entreprise, adresse: user.adresse } : { nom: "", entreprise: "", adresse: null }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détail des lignes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devis.lignes.map((l) => (
                <div key={l.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <div>
                    <p className="font-medium">{l.description}</p>
                    <p className="text-sm text-slate-500">
                      {l.quantite} {UNITE_LABELS[l.unite] ?? l.unite} × {formatCurrency(l.prixUnitaire)}
                    </p>
                  </div>
                  <span className="font-medium">{formatCurrency(l.montantHT)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold">
                <span>Total HT</span>
                <span>{formatCurrency(devis.montantHT)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA</span>
                <span>{formatCurrency(devis.tva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(devis.montantTTC)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="text-slate-500">Client :</span> {devis.client.prenom} {devis.client.nom}</p>
            <p><span className="text-slate-500">Email :</span> {devis.client.email}</p>
            {devis.dateValidite && (
              <p><span className="text-slate-500">Valide jusqu&apos;au :</span> {formatDate(devis.dateValidite)}</p>
            )}
            {devis.notes && (
              <p><span className="text-slate-500">Notes :</span> {devis.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
