"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyForPDF, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120, color: "#666" },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: "row", marginBottom: 8, borderBottomWidth: 1, paddingBottom: 4 },
  tableRow: { flexDirection: "row", marginBottom: 6 },
  colDesc: { flex: 2 },
  colQte: { width: 50 },
  colPrix: { width: 70 },
  colTotal: { width: 70 },
  totals: { marginTop: 20, marginLeft: "auto", width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalTTC: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, fontSize: 12, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#666" },
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
  client: { nom: string; prenom: string; email: string; adresseChantier?: string | null };
  artisan: { nom: string; entreprise: string; email?: string; adresse?: string | null };
  lignes: Ligne[];
  montantHT: number;
  tva: number;
  montantTTC: number;
  dateValidite?: Date | null;
  notes?: string | null;
};

export function DevisPDF({ numero, client, artisan, lignes, montantHT, tva, montantTTC, dateValidite, notes }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{artisan.entreprise}</Text>
          <Text style={styles.subtitle}>{artisan.nom}{artisan.adresse && ` - ${artisan.adresse}`}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>Devis {numero}</Text>
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
              <Text style={styles.label}>Adresse chantier :</Text>
              <Text>{client.adresseChantier}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQte}>Qté</Text>
            <Text style={styles.colPrix}>Prix unit.</Text>
            <Text style={styles.colTotal}>Total HT</Text>
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
