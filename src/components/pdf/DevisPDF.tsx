"use client";

import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyForPDF, formatDate } from "@/lib/utils";

type DocumentStyle = "MODERNE" | "CLASSIQUE" | "EPURE";

const COLORS = {
  MODERNE: { accent: "#2563EB", headerBg: "#f0f7ff", subtotalBg: "#f8fafc", text: "#111827", muted: "#666", border: "#e5e7eb" },
  CLASSIQUE: { accent: "#374151", headerBg: "#f3f4f6", subtotalBg: "#f9fafb", text: "#111827", muted: "#4b5563", border: "#9ca3af" },
  EPURE: { accent: "#000000", headerBg: "#ffffff", subtotalBg: "#ffffff", text: "#000000", muted: "#6b7280", border: "#d1d5db" },
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
      marginBottom: 20,
      ...(style === "MODERNE" ? { borderBottomWidth: 2, borderBottomColor: c.accent, paddingBottom: 16 } : {}),
      ...(style === "CLASSIQUE" ? { borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 16 } : {}),
      ...(style === "EPURE" ? { marginBottom: 30 } : {}),
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      ...(style === "MODERNE" ? { color: c.accent } : {}),
    },
    subtitle: { fontSize: 10, color: c.muted },
    section: { marginBottom: 16 },
    row: { flexDirection: "row" as const, marginBottom: 4 },
    label: {
      width: 120,
      color: c.muted,
      ...(style === "CLASSIQUE" ? { fontWeight: "bold" as const } : {}),
    },
    table: {
      marginTop: 20,
    },
    tableHeader: {
      flexDirection: "row" as const,
      marginBottom: 8,
      paddingBottom: 4,
      paddingTop: 4,
      paddingLeft: 6,
      paddingRight: 6,
      ...(style === "MODERNE" ? { backgroundColor: c.accent, borderRadius: 2 } : {}),
      ...(style === "CLASSIQUE" ? { backgroundColor: c.headerBg, borderWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { borderBottomWidth: 1, borderBottomColor: c.accent } : {}),
    },
    tableHeaderText: {
      ...(style === "MODERNE" ? { color: "#ffffff" } : {}),
      ...(style === "CLASSIQUE" ? { color: c.text, fontWeight: "bold" as const } : {}),
      ...(style === "EPURE" ? { color: c.text, fontWeight: "bold" as const, fontSize: 9 } : {}),
    },
    tableRow: {
      flexDirection: "row" as const,
      marginBottom: 6,
      paddingVertical: 3,
      paddingLeft: 6,
      paddingRight: 6,
      ...(style === "CLASSIQUE" ? { borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { paddingVertical: 6 } : {}),
      ...(style === "MODERNE" ? { borderBottomWidth: 0.5, borderBottomColor: c.border } : {}),
    },
    colDesc: { flex: 2 },
    colQte: { width: 50 },
    colPrix: { width: 70 },
    colTotal: { width: 70 },
    totals: {
      marginTop: 20,
      marginLeft: "auto" as const,
      width: 200,
      ...(style === "MODERNE" ? { padding: 10, backgroundColor: c.subtotalBg, borderRadius: 4 } : {}),
      ...(style === "CLASSIQUE" ? { padding: 10, borderWidth: 1, borderColor: c.border } : {}),
      ...(style === "EPURE" ? { paddingTop: 12 } : {}),
    },
    totalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 4 },
    totalTTC: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginTop: 8,
      fontSize: 12,
      fontWeight: "bold" as const,
      ...(style === "MODERNE" ? { borderTopWidth: 2, borderTopColor: c.accent, paddingTop: 6 } : {}),
      ...(style === "CLASSIQUE" ? { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 6 } : {}),
      ...(style === "EPURE" ? { borderTopWidth: 1, borderTopColor: c.accent, paddingTop: 8 } : {}),
    },
    footer: {
      position: "absolute" as const,
      bottom: 30,
      left: 40,
      right: 40,
      fontSize: 8,
      color: c.muted,
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
  client: { nom: string; prenom: string; email: string; adresseChantier?: string | null };
  artisan: { nom: string; entreprise: string; email?: string; adresse?: string | null; siret?: string | null; identifiantType?: string | null; logo?: string | null };
  lignes: Ligne[];
  montantHT: number;
  tva: number;
  montantTTC: number;
  dateValidite?: Date | null;
  notes?: string | null;
  style?: DocumentStyle;
};

export function DevisPDF({ numero, client, artisan, lignes, montantHT, tva, montantTTC, dateValidite, notes, style = "MODERNE" }: Props) {
  const styles = getStyles(style);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", marginBottom: 4, alignItems: "flex-start", gap: 12 }}>
            {artisan.logo && (
              <Image src={artisan.logo} style={{ width: 80, height: 50, objectFit: "contain" }} />
            )}
            <View>
              <Text style={styles.title}>{artisan.entreprise}</Text>
              <Text style={styles.subtitle}>{artisan.nom}{artisan.adresse && ` - ${artisan.adresse}`}</Text>
              {artisan.siret && (
                <Text style={styles.subtitle}>
                  {artisan.identifiantType === "BCE" ? "BCE" : artisan.identifiantType === "IDE" ? "IDE" : "SIRET"}: {artisan.siret}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8, ...(style === "MODERNE" ? { color: COLORS.MODERNE.accent } : {}) }}>
            Devis {numero}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client :</Text>
            <Text>{client.prenom} {client.nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email :</Text>
            <Text>{client.email}</Text>
          </View>
          {client.adresseChantier && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse d&apos;intervention :</Text>
              <Text>{client.adresseChantier}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.colQte, styles.tableHeaderText]}>Qté</Text>
            <Text style={[styles.colPrix, styles.tableHeaderText]}>Prix unit.</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Total HT</Text>
          </View>
          {lignes.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{l.description}</Text>
              <Text style={styles.colQte}>{l.quantite} {l.unite}</Text>
              <Text style={styles.colPrix}>{formatCurrencyForPDF(l.prixUnitaire)}</Text>
              <Text style={styles.colTotal}>{formatCurrencyForPDF(l.montantHT)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
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

        {dateValidite && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.subtitle}>Valide jusqu&apos;au {formatDate(dateValidite)}</Text>
          </View>
        )}

        {notes && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.subtitle}>Notes : {notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Devis établi à titre informatif. Mentions legales.</Text>
        </View>
      </Page>
    </Document>
  );
}
