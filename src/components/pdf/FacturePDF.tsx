"use client";

import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyForPDF, formatDate } from "@/lib/utils";

type DocumentStyle = "MODERNE" | "CLASSIQUE" | "EPURE";

const COLORS = {
  MODERNE: { accent: "#2563EB", headerBg: "#f0f7ff", subtotalBg: "#f8fafc", text: "#111827", muted: "#6b7280", border: "#e5e7eb", condBg: "#fffbeb" },
  CLASSIQUE: { accent: "#374151", headerBg: "#f3f4f6", subtotalBg: "#f9fafb", text: "#111827", muted: "#4b5563", border: "#9ca3af", condBg: "#f9fafb" },
  EPURE: { accent: "#000000", headerBg: "#ffffff", subtotalBg: "#ffffff", text: "#000000", muted: "#6b7280", border: "#d1d5db", condBg: "#fafafa" },
};

function getStyles(style: DocumentStyle) {
  const c = COLORS[style];

  return StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      color: c.text,
      ...(style === "EPURE" ? { padding: 50 } : {}),
    },
    header: {
      marginBottom: 24,
      paddingBottom: 16,
      ...(style === "MODERNE" ? { borderBottomWidth: 1, borderBottomColor: c.border } : {}),
      ...(style === "CLASSIQUE" ? { borderBottomWidth: 2, borderBottomColor: c.border } : {}),
      ...(style === "EPURE" ? { marginBottom: 30 } : {}),
    },
    companyName: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 4,
      ...(style === "MODERNE" ? { color: c.accent } : {}),
      ...(style === "CLASSIQUE" ? { color: c.text } : {}),
      ...(style === "EPURE" ? { color: c.text, fontSize: 18 } : {}),
    },
    companyDetails: { fontSize: 9, color: c.muted, lineHeight: 1.4 },
    docTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
      ...(style === "MODERNE" ? { color: c.accent } : {}),
    },
    docSubtitle: { fontSize: 9, color: c.muted, marginBottom: 16 },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 6,
      ...(style === "CLASSIQUE" ? { textDecoration: "underline" } : {}),
    },
    row: { flexDirection: "row" as const, marginBottom: 3 },
    label: {
      width: 100,
      color: c.muted,
      ...(style === "CLASSIQUE" ? { fontWeight: "bold" as const } : {}),
    },
    value: { flex: 1 },
    table: { marginTop: 20 },
    tableHeader: {
      flexDirection: "row" as const,
      marginBottom: 8,
      paddingBottom: 6,
      paddingTop: 6,
      paddingLeft: 8,
      paddingRight: 8,
      ...(style === "MODERNE" ? { borderBottomWidth: 2, borderBottomColor: c.accent, backgroundColor: c.subtotalBg } : {}),
      ...(style === "CLASSIQUE" ? { backgroundColor: c.headerBg, borderWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { borderBottomWidth: 1, borderBottomColor: c.accent } : {}),
    },
    tableHeaderText: {
      fontWeight: "bold" as const,
      ...(style === "MODERNE" ? { color: c.accent } : {}),
      ...(style === "EPURE" ? { fontSize: 9 } : {}),
    },
    tableRow: {
      flexDirection: "row" as const,
      marginBottom: 8,
      paddingVertical: 4,
      paddingLeft: 8,
      paddingRight: 8,
      ...(style === "MODERNE" ? { borderBottomWidth: 0.5, borderBottomColor: c.border } : {}),
      ...(style === "CLASSIQUE" ? { borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { paddingVertical: 6 } : {}),
    },
    colDesc: { flex: 2, paddingRight: 8 },
    colQte: { width: 45, paddingRight: 4 },
    colUnite: { width: 40, paddingRight: 4 },
    colPrix: { width: 65, paddingRight: 4 },
    colTva: { width: 40, paddingRight: 4 },
    colTotal: { width: 70 },
    totals: {
      marginTop: 24,
      marginLeft: "auto" as const,
      width: 220,
      padding: 12,
      borderRadius: 4,
      ...(style === "MODERNE" ? { backgroundColor: c.subtotalBg } : {}),
      ...(style === "CLASSIQUE" ? { borderWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { padding: 0, paddingTop: 12 } : {}),
    },
    totalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 6 },
    totalTTC: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginTop: 8,
      paddingTop: 8,
      fontSize: 14,
      fontWeight: "bold" as const,
      ...(style === "MODERNE" ? { borderTopWidth: 1, borderTopColor: c.accent } : {}),
      ...(style === "CLASSIQUE" ? { borderTopWidth: 2, borderTopColor: c.border } : {}),
      ...(style === "EPURE" ? { borderTopWidth: 1, borderTopColor: c.accent } : {}),
    },
    conditions: {
      marginTop: 24,
      padding: 12,
      backgroundColor: c.condBg,
      borderRadius: 4,
      ...(style === "CLASSIQUE" ? { borderWidth: 1, borderColor: c.border } : {}),
    },
    conditionsTitle: { fontSize: 9, fontWeight: "bold" as const, marginBottom: 4 },
    conditionsText: { fontSize: 8, color: c.muted, lineHeight: 1.4 },
    footer: {
      position: "absolute" as const,
      bottom: 30,
      left: 40,
      right: 40,
      fontSize: 7,
      color: "#9ca3af",
      lineHeight: 1.3,
    },
  });
}

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
  style?: DocumentStyle;
};

const UNITE_LABELS: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "h",
  UNITE: "u",
};

export function FacturePDF({ numero, client, artisan, lignes, montantHT, tva, montantTTC, acompte, dateEcheance, dateFacture, style = "MODERNE" }: Props) {
  const styles = getStyles(style);
  const uniteStr = (u: string) => UNITE_LABELS[u] || u;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", marginBottom: 8, alignItems: "flex-start", gap: 12 }}>
            {artisan.logo && (
              <>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={artisan.logo} style={{ width: 80, height: 50, objectFit: "contain" }} />
              </>
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
                {artisan.identifiantType === "BCE" ? "BCE" : artisan.identifiantType === "IDE" ? "IDE" : "SIRET"}: {artisan.siret}
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
            <Text style={[styles.colDesc, styles.tableHeaderText]}>Désignation</Text>
            <Text style={[styles.colQte, styles.tableHeaderText]}>Qté</Text>
            <Text style={[styles.colUnite, styles.tableHeaderText]}>Unité</Text>
            <Text style={[styles.colPrix, styles.tableHeaderText]}>Prix unit. HT</Text>
            <Text style={[styles.colTva, styles.tableHeaderText]}>TVA</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Total HT</Text>
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
