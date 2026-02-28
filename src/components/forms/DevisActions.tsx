"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { DevisPDF } from "@/components/pdf/DevisPDF";
import { toast } from "sonner";

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

type Devis = {
  id: string;
  numero: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  dateValidite: Date | null;
  notes: string | null;
  statut: string;
  lignes: Array<{
    description: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    tauxTVA: number;
    montantHT: number;
  }>;
};

type Client = { nom: string; prenom: string; email: string; adresseChantier: string | null };
type Artisan = { nom: string; entreprise: string; adresse: string | null };

export function DevisActions({
  devis,
  client,
  artisan,
}: {
  devis: Devis;
  client: Client;
  artisan: Artisan;
}) {
  const router = useRouter();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatut(statut: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/devis/${devis.id}`, {
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

  const lignes = devis.lignes.map((l) => ({
    ...l,
    unite: UNITE_LABELS[l.unite] ?? l.unite,
  }));

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPdfOpen(true)}>
          Voir PDF
        </Button>
        {devis.statut === "BROUILLON" && (
          <Button onClick={() => updateStatut("ENVOYE")} disabled={loading}>
            Marquer envoyé
          </Button>
        )}
        {devis.statut === "ENVOYE" && (
          <>
            <Button onClick={() => updateStatut("ACCEPTE")} disabled={loading}>
              Accepter
            </Button>
            <Button variant="outline" onClick={() => updateStatut("REFUSE")} disabled={loading}>
              Refuser
            </Button>
          </>
        )}
        {devis.statut === "ACCEPTE" && (
          <Button asChild>
            <Link href={`/factures/nouvelle?devisId=${devis.id}`}>Convertir en facture</Link>
          </Button>
        )}
      </div>

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader className="flex-row items-center justify-between space-y-0">
            <DialogTitle>Prévisualisation - {devis.numero}</DialogTitle>
            <PDFDownloadLink
              document={
                <DevisPDF
                  numero={devis.numero}
                  client={client}
                  artisan={artisan}
                  lignes={lignes}
                  montantHT={devis.montantHT}
                  tva={devis.tva}
                  montantTTC={devis.montantTTC}
                  dateValidite={devis.dateValidite}
                  notes={devis.notes}
                />
              }
              fileName={`devis-${devis.numero}.pdf`}
              className="ml-auto inline-flex items-center justify-center rounded-lg bg-zypta-blue px-4 py-2 text-sm font-medium text-white hover:bg-zypta-blue/90"
            >
              {({ loading }) => (loading ? "Génération…" : "Télécharger PDF")}
            </PDFDownloadLink>
          </DialogHeader>
          <div className="h-96 overflow-auto">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <DevisPDF
                numero={devis.numero}
                client={client}
                artisan={artisan}
                lignes={lignes}
                montantHT={devis.montantHT}
                tva={devis.tva}
                montantTTC={devis.montantTTC}
                dateValidite={devis.dateValidite}
                notes={devis.notes}
              />
            </PDFViewer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
