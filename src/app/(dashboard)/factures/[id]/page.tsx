import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { FactureActions } from "@/components/forms/FactureActions";

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYEE: "Envoyée",
  PAYEE: "Payée",
  EN_RETARD: "En retard",
};

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const facture = await prisma.facture.findFirst({
    where: { id, userId },
    include: { client: true, lignes: true, devis: true },
  });

  if (!facture) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/factures">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{facture.numero}</h1>
            <p className="text-[var(--text-muted)]">
              {facture.client.prenom} {facture.client.nom} - {STATUT_LABELS[facture.statut] ?? facture.statut}
            </p>
          </div>
        </div>
        <FactureActions
          facture={facture}
          client={facture.client}
          artisan={user ? { nom: user.nom, entreprise: user.entreprise, adresse: user.adresse, email: user.email, telephone: user.telephone, siret: user.siret, identifiantType: user.identifiantType, logo: user.logo } : { nom: "", entreprise: "", adresse: null }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détail des lignes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facture.lignes.map((l) => (
                <div key={l.id} className="flex justify-between border-b border-[var(--border)] pb-2">
                  <div>
                    <p className="font-medium">{l.description}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {l.quantite} {UNITE_LABELS[l.unite] ?? l.unite} × {formatCurrency(l.prixUnitaire)}
                    </p>
                  </div>
                  <span className="font-medium">{formatCurrency(l.montantHT)}</span>
                </div>
              ))}
              {facture.acompte > 0 && (
                <div className="flex justify-between text-sm text-[var(--text-muted)]">
                  <span>Acompte</span>
                  <span>{formatCurrency(facture.acompte)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 font-bold">
                <span>Total HT</span>
                <span>{formatCurrency(facture.montantHT)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA</span>
                <span>{formatCurrency(facture.tva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(facture.montantTTC)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="text-[var(--text-muted)]">Client :</span> {facture.client.prenom} {facture.client.nom}</p>
            <p><span className="text-[var(--text-muted)]">Email :</span> {facture.client.email}</p>
            {facture.dateEcheance && (
              <p><span className="text-[var(--text-muted)]">Échéance :</span> {formatDate(facture.dateEcheance)}</p>
            )}
            {facture.devis && (
              <p>
                <span className="text-[var(--text-muted)]">Devis :</span>{" "}
                <Link href={`/devis/${facture.devis.id}`} className="text-nova-mid hover:underline">
                  {facture.devis.numero}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
