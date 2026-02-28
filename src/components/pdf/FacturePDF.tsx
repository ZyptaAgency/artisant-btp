"use client";

import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyForPDF, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  companyName: { fontSize: 20, fontWeight: "bold", color: "#2563EB", marginBottom: 4 },
  companyDetails: { fontSize: 9, color: "#6b7280", lineHeight: 1.4 },
  docTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  docSubtitle: { fontSize: 9, color: "#6b7280", marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#374151", marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 100, color: "#6b7280" },
  value: { flex: 1 },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    backgroundColor: "#f8fafc",
    paddingTop: 6,
    paddingLeft: 8,
    paddingRight: 8,
  },
  tableRow: { flexDirection: "row", marginBottom: 8, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  colDesc: { flex: 2, paddingRight: 8 },
  colQte: { width: 45, paddingRight: 4 },
  colUnite: { width: 40, paddingRight: 4 },
  colPrix: { width: 65, paddingRight: 4 },
  colTva: { width: 40, paddingRight: 4 },
  colTotal: { width: 70 },
  totals: { marginTop: 24, marginLeft: "auto", width: 220, padding: 12, backgroundColor: "#f8fafc", borderRadius: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalTTC: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, fontSize: 14, fontWeight: "bold", borderTopWidth: 1, borderTopColor: "#2563EB" },
  conditions: { marginTop: 24, padding: 12, backgroundColor: "#fffbeb", borderRadius: 4 },
  conditionsTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  conditionsText: { fontSize: 8, color: "#6b7280", lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7, color: "#9ca3af", lineHeight: 1.3 },
});

type Ligne = {
  description: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  tauxTVA: number;
  montantHT: number;
};

type Props = {
  numero: string;
  client: { nom: string; prenom: string; email: string; telephone?: string | null; adresseChantier?: string | null };
  artisan: { nom: string; entreprise: string; email?: string | null; telephone?: string | null; adresse?: string | null; siret?: string | null; identifiantType?: string | null; logo?: string | null };
  lignes: Ligne[];
  montantHT: number;
  tva: number;
  montantTTC: number;
  acompte: number;
  dateEcheance?: Date | null;
  dateFacture?: Date | null;
};

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "h",
  UNITE: "u",
};

export function FacturePDF({ numero, client, artisan, lignes, montantHT, tva, montantTTC, acompte, dateEcheance, dateFacture }: Props) {
  const uniteStr = (u: string) => UNITE_LABELS[u] || u;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", marginBottom: 8, alignItems: "flex-start", gap: 12 }}>
            {artisan.logo && (
              <Image src={artisan.logo} style={{ width: 80, height: 50, objectFit: "contain" }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{artisan.entreprise}</Text>
              <View style={styles.companyDetails}>
            <Text>{artisan.nom}</Text>
            {artisan.adresse && <Text>{artisan.adresse}</Text>}
            {artisan.telephone && <Text>Tel: {artisan.telephone}</Text>}
            {artisan.email && <Text>Email: {artisan.email}</Text>}
            {artisan.siret && (
              <Text>
                {artisan.identifiantType === "BCE" ? "BCE" : "SIRET"}: {artisan.siret}
              </Text>
            )}
          </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.docTitle}>Facture {numero}</Text>
          <Text style={styles.docSubtitle}>
            Date d&apos;émission : {formatDate(dateFacture || new Date())}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom :</Text>
            <Text style={styles.value}>{client.prenom} {client.nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email :</Text>
            <Text style={styles.value}>{client.email}</Text>
          </View>
          {client.telephone && (
            <View style={styles.row}>
              <Text style={styles.label}>Tél :</Text>
              <Text style={styles.value}>{client.telephone}</Text>
            </View>
          )}
          {client.adresseChantier && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse :</Text>
              <Text style={styles.value}>{client.adresseChantier}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Désignation</Text>
            <Text style={styles.colQte}>Qté</Text>
            <Text style={styles.colUnite}>Unité</Text>
            <Text style={styles.colPrix}>Prix unit. HT</Text>
            <Text style={styles.colTva}>TVA</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {lignes.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{l.description}</Text>
              <Text style={styles.colQte}>{l.quantite}</Text>
              <Text style={styles.colUnite}>{uniteStr(l.unite)}</Text>
              <Text style={styles.colPrix}>{formatCurrencyForPDF(l.prixUnitaire)}</Text>
              <Text style={styles.colTva}>{l.tauxTVA}%</Text>
              <Text style={styles.colTotal}>{formatCurrencyForPDF(l.montantHT)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          {acompte > 0 && (
            <View style={styles.totalRow}>
              <Text>Acompte</Text>
              <Text>{formatCurrencyForPDF(acompte)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{formatCurrencyForPDF(montantHT)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA</Text>
            <Text>{formatCurrencyForPDF(tva)}</Text>
          </View>
          <View style={styles.totalTTC}>
            <Text>Total TTC</Text>
            <Text>{formatCurrencyForPDF(montantTTC)}</Text>
          </View>
        </View>

        <View style={styles.conditions}>
          <Text style={styles.conditionsTitle}>Conditions de paiement</Text>
          <Text style={styles.conditionsText}>
            Paiement à réception de facture.
            {dateEcheance && ` Date d'échéance : ${formatDate(dateEcheance)}.`}
            {" "}En cas de retard, des pénalités de 3 fois le taux d&apos;intérêt légal seront appliquées.
            Indemnité forfaitaire pour frais de recouvrement : 40€.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Facture établie à titre informatif. TVA non applicable, art. 293 B du CGI.
            En cas de litige, les tribunaux du ressort du siège social sont seuls compétents.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
