"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { FacturePDF } from "@/components/pdf/FacturePDF";
import { toast } from "sonner";

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

type Facture = {
  id: string;
  numero: string;
  statut: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  acompte: number;
  dateEcheance: Date | null;
  createdAt?: Date;
  lignes: Array<{
    description: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    tauxTVA: number;
    montantHT: number;
  }>;
};

type Client = { nom: string; prenom: string; email: string; telephone?: string | null; adresseChantier?: string | null };
type Artisan = { nom: string; entreprise: string; adresse?: string | null; email?: string | null; telephone?: string | null; siret?: string | null; identifiantType?: string | null; logo?: string | null };

export function FactureActions({
  facture,
  client,
  artisan,
}: {
  facture: Facture;
  client: Client;
  artisan: Artisan;
}) {
  const router = useRouter();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatut(statut: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/factures/${facture.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Statut mis à jour");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  }

  const lignes = facture.lignes.map((l) => ({
    ...l,
    unite: UNITE_LABELS[l.unite] ?? l.unite,
  }));

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPdfOpen(true)}>
          Voir PDF
        </Button>
        {facture.statut === "BROUILLON" && (
          <Button onClick={() => updateStatut("ENVOYEE")} disabled={loading}>
            Marquer envoyée
          </Button>
        )}
        {(facture.statut === "ENVOYEE" || facture.statut === "EN_RETARD") && (
          <Button onClick={() => updateStatut("PAYEE")} disabled={loading}>
            Marquer payée
          </Button>
        )}
      </div>

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader className="flex-row items-center justify-between space-y-0">
            <DialogTitle>Prévisualisation - {facture.numero}</DialogTitle>
            <PDFDownloadLink
              document={
                <FacturePDF
                  numero={facture.numero}
                  client={client}
                  artisan={artisan}
                  lignes={lignes}
                  montantHT={facture.montantHT}
                  tva={facture.tva}
                  montantTTC={facture.montantTTC}
                  acompte={facture.acompte}
                  dateEcheance={facture.dateEcheance}
                  dateFacture={facture.createdAt}
                />
              }
              fileName={`facture-${facture.numero}.pdf`}
              className="ml-auto inline-flex items-center justify-center rounded-lg bg-zypta-blue px-4 py-2 text-sm font-medium text-white hover:bg-zypta-blue/90"
            >
              {({ loading }) => (loading ? "Génération…" : "Télécharger PDF")}
            </PDFDownloadLink>
          </DialogHeader>
          <div className="h-96 overflow-auto">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <FacturePDF
                numero={facture.numero}
                client={client}
                artisan={artisan}
                lignes={lignes}
                montantHT={facture.montantHT}
                tva={facture.tva}
                montantTTC={facture.montantTTC}
                acompte={facture.acompte}
                dateEcheance={facture.dateEcheance}
                dateFacture={facture.createdAt}
              />
            </PDFViewer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
