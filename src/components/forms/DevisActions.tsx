"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
type Artisan = { nom: string; entreprise: string; adresse: string | null; siret?: string | null; identifiantType?: string | null; logo?: string | null };
type DocumentStyle = "MODERNE" | "CLASSIQUE" | "EPURE";

export function DevisActions({
  devis,
  client,
  artisan,
  documentStyle,
}: {
  devis: Devis;
  client: Client;
  artisan: Artisan;
  documentStyle?: DocumentStyle;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  async function updateStatut(statut: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/devis/${devis.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error(t("errors.generic"));
      toast.success(t("devis.statusUpdated"));
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function convertirEnFacture() {
    setConverting(true);
    try {
      const res = await fetch(`/api/devis/${devis.id}/convertir-facture`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("errors.saveError"));
      }
      const facture = await res.json();
      toast.success(t("devis.invoiceCreated"));
      router.push(`/factures/${facture.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errors.saveError"));
    } finally {
      setConverting(false);
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
          {t("devis.seePdf")}
        </Button>
        {devis.statut === "BROUILLON" && (
          <>
            <Button variant="outline" onClick={() => router.push(`/devis/${devis.id}/modifier`)}>
              {t("devis.edit")}
            </Button>
            <Button onClick={() => updateStatut("ENVOYE")} disabled={loading}>
              {t("devis.markSent")}
            </Button>
          </>
        )}
        {devis.statut === "ENVOYE" && (
          <>
            <Button onClick={() => updateStatut("ACCEPTE")} disabled={loading}>
              {t("devis.accept")}
            </Button>
            <Button variant="outline" onClick={() => updateStatut("REFUSE")} disabled={loading}>
              {t("devis.reject")}
            </Button>
            <Button onClick={convertirEnFacture} disabled={converting}>
              {converting ? t("devis.creating") : t("devis.createInvoice")}
            </Button>
          </>
        )}
        {devis.statut === "ACCEPTE" && (
          <Button asChild>
            <Link href={`/factures/nouvelle?devisId=${devis.id}`}>{t("devis.convertToInvoice")}</Link>
          </Button>
        )}
      </div>

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader className="flex-row items-center justify-between space-y-0">
            <DialogTitle>{t("devis.preview")} - {devis.numero}</DialogTitle>
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
                  style={documentStyle}
                />
              }
              fileName={`devis-${devis.numero}.pdf`}
              className="ml-auto inline-flex items-center justify-center rounded-lg bg-zypta-blue px-4 py-2 text-sm font-medium text-white hover:bg-zypta-blue/90"
            >
              {({ loading }) => (loading ? t("devis.generating") : t("devis.downloadPdf"))}
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
                style={documentStyle}
              />
            </PDFViewer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
