"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const uniteLabels: Record<string, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

type Ligne = {
  description: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  tauxTVA: number;
};

export default function ModifierFacturePage() {
  const router = useRouter();
  const params = useParams();
  const factureId = params.id as string;

  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [dateEcheance, setDateEcheance] = useState("");
  const [acompte, setAcompte] = useState(0);
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/factures/${factureId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.statut !== "BROUILLON") {
          toast.error("Seules les factures brouillon peuvent être modifiées");
          router.push(`/factures/${factureId}`);
          return;
        }
        setNumero(data.numero);
        setAcompte(data.acompte || 0);
        setDateEcheance(data.dateEcheance ? new Date(data.dateEcheance).toISOString().split("T")[0] : "");
        setLignes(data.lignes.map((l: Ligne) => ({
          description: l.description,
          quantite: l.quantite,
          unite: l.unite,
          prixUnitaire: l.prixUnitaire,
          tauxTVA: l.tauxTVA,
        })));
        setLoading(false);
      });
  }, [factureId, router]);

  const totalHT = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const totalTVA = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (l.tauxTVA / 100), 0);
  const totalTTC = totalHT + totalTVA;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lignesValides = lignes
      .filter((l) => l.description?.trim())
      .map((l) => ({
        ...l,
        quantite: Math.max(0.01, Number(l.quantite) || 1),
        prixUnitaire: Math.max(0, Number(l.prixUnitaire) || 0),
        tauxTVA: [10, 20].includes(Number(l.tauxTVA)) ? Number(l.tauxTVA) : 20,
      }));

    if (lignesValides.length === 0) {
      toast.error("Ajoutez au moins une ligne avec une description");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/factures/${factureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateEcheance: dateEcheance || undefined,
          acompte: Math.max(0, Number(acompte) || 0),
          lignes: lignesValides,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Facture mise à jour");
      router.push(`/factures/${factureId}`);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-[var(--text-muted)]">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/factures/${factureId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Modifier {numero}</h1>
          <p className="text-[var(--text-muted)]">Facture brouillon — modifiable</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lignes de prestation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date d&apos;échéance</Label>
                <Input type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Acompte (€)</Label>
                <Input type="number" step="0.01" value={acompte} onChange={(e) => setAcompte(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-4">
              {lignes.map((l, i) => (
                <div key={i} className="rounded-lg border border-[var(--border)] p-4 space-y-3">
                  <div className="flex gap-2 flex-wrap items-end">
                    <div className="flex-1 min-w-[250px] space-y-1">
                      <Label className="text-xs">Désignation</Label>
                      <Input value={l.description} onChange={(e) => setLignes((prev) => {
                        const n = [...prev]; n[i] = { ...n[i], description: e.target.value }; return n;
                      })} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Quantité</Label>
                      <Input type="number" step="0.01" min="0" value={l.quantite} onChange={(e) => setLignes((prev) => {
                        const n = [...prev]; n[i] = { ...n[i], quantite: Number(e.target.value) }; return n;
                      })} />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Unité</Label>
                      <Select value={l.unite} onChange={(e) => setLignes((prev) => {
                        const n = [...prev]; n[i] = { ...n[i], unite: e.target.value }; return n;
                      })}>
                        {Object.entries(uniteLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Prix unit. HT (€)</Label>
                      <Input type="number" step="0.01" min="0" value={l.prixUnitaire || ""} onChange={(e) => setLignes((prev) => {
                        const n = [...prev]; n[i] = { ...n[i], prixUnitaire: Number(e.target.value) || 0 }; return n;
                      })} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">TVA</Label>
                      <Select value={String(l.tauxTVA)} onChange={(e) => setLignes((prev) => {
                        const n = [...prev]; n[i] = { ...n[i], tauxTVA: Number(e.target.value) }; return n;
                      })}>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                      </Select>
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Total HT</Label>
                      <span className="flex h-10 items-center font-medium gradient-text">{formatCurrency(l.quantite * (l.prixUnitaire || 0))}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setLignes((prev) => prev.filter((_, j) => j !== i))} disabled={lignes.length <= 1}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setLignes((prev) => [...prev, { description: "", quantite: 1, unite: "M2", prixUnitaire: 0, tauxTVA: 20 }])}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
            <div className="rounded-lg bg-white/5 border border-[var(--border)] p-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Total HT</span><span>{formatCurrency(totalHT)}</span></div>
              <div className="flex justify-between text-sm"><span>TVA</span><span>{formatCurrency(totalTVA)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]"><span>Total TTC</span><span>{formatCurrency(totalTTC)}</span></div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
