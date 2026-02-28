"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { UniteMesure } from "@prisma/client";

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
  unite: UniteMesure;
  prixUnitaire: number;
  tauxTVA: number;
};

export default function NouvelleFacturePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("clientId") ?? undefined;
  const devisId = searchParams.get("devisId") ?? undefined;

  const [clients, setClients] = useState<{ id: string; nom: string; prenom: string }[]>([]);
  const [, setDevis] = useState<{
    clientId: string;
    lignes: Array<{ description: string; quantite: number; unite: string; prixUnitaire: number; tauxTVA: number }>;
  } | null>(null);
  const [lignes, setLignes] = useState<Ligne[]>([
    { description: "", quantite: 1, unite: "M2", prixUnitaire: 0, tauxTVA: 20 },
  ]);
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");
  const [dateEcheance, setDateEcheance] = useState("");
  const [acompte, setAcompte] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  useEffect(() => {
    if (devisId) {
      fetch(`/api/devis/${devisId}`)
        .then((r) => r.json())
        .then((d) => {
          setDevis({
            clientId: d.clientId,
            lignes: d.lignes.map((l: { description: string; quantite: number; unite: string; prixUnitaire: number; tauxTVA: number }) => ({
              description: l.description,
              quantite: l.quantite,
              unite: l.unite,
              prixUnitaire: l.prixUnitaire,
              tauxTVA: l.tauxTVA,
            })),
          });
          setSelectedClientId(d.clientId);
          setLignes(d.lignes.map((l: { description: string; quantite: number; unite: string; prixUnitaire: number; tauxTVA: number }) => ({
            description: l.description,
            quantite: l.quantite,
            unite: l.unite as UniteMesure,
            prixUnitaire: l.prixUnitaire,
            tauxTVA: l.tauxTVA,
          })));
          const d30 = new Date();
          d30.setDate(d30.getDate() + 30);
          setDateEcheance(d30.toISOString().split("T")[0]);
        });
    } else if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [devisId, clientId]);

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

    if (!selectedClientId) {
      toast.error("Sélectionnez un client");
      return;
    }
    if (lignesValides.length === 0) {
      toast.error("Ajoutez au moins une ligne avec une description");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          devisId: devisId || undefined,
          dateEcheance: dateEcheance || undefined,
          acompte: Math.max(0, Number(acompte) || 0),
          lignes: lignesValides,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la création");
        return;
      }
      toast.success("Facture créée");
      router.push(`/factures/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Nouvelle facture</h1>
        <p className="text-[var(--text-muted)]">Créez une nouvelle facture</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={!!devisId}
                >
                  <option value="">Sélectionner</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date d&apos;échéance</Label>
                <Input type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Acompte (€)</Label>
              <Input type="number" step="0.01" value={acompte} onChange={(e) => setAcompte(Number(e.target.value))} />
            </div>
            <div className="space-y-4">
              <Label>Lignes de prestation</Label>
              <p className="text-sm text-[var(--text-muted)]">Détaillez chaque prestation avec sa description et son prix unitaire HT</p>
              {lignes.map((l, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex gap-2 flex-wrap items-end">
                    <div className="flex-1 min-w-[250px] space-y-1">
                      <Label className="text-xs">Désignation / Description</Label>
                      <Input placeholder="Ex: Pose carrelage sol, Rénovation salle de bain..." value={l.description} onChange={(e) => setLignes((prev) => {
                        const n = [...prev];
                        n[i] = { ...n[i], description: e.target.value };
                        return n;
                      })} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Quantité</Label>
                      <Input type="number" step="0.01" min="0" placeholder="1" value={l.quantite} onChange={(e) => setLignes((prev) => {
                        const n = [...prev];
                        n[i] = { ...n[i], quantite: Number(e.target.value) };
                        return n;
                      })} />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Unité</Label>
                      <Select value={l.unite} onChange={(e) => setLignes((prev) => {
                        const n = [...prev];
                        n[i] = { ...n[i], unite: e.target.value as UniteMesure };
                        return n;
                      })}>
                        {Object.entries(uniteLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Prix unitaire HT (€)</Label>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" value={l.prixUnitaire || ""} onChange={(e) => setLignes((prev) => {
                        const n = [...prev];
                        n[i] = { ...n[i], prixUnitaire: Number(e.target.value) || 0 };
                        return n;
                      })} />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">TVA</Label>
                      <Select value={String(l.tauxTVA)} onChange={(e) => setLignes((prev) => {
                        const n = [...prev];
                        n[i] = { ...n[i], tauxTVA: Number(e.target.value) };
                        return n;
                      })}>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                      </Select>
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Total HT</Label>
                      <span className="flex h-10 items-center font-medium text-nova-mid">{formatCurrency(l.quantite * (l.prixUnitaire || 0))}</span>
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
            <div className="rounded-lg bg-white/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total HT</span>
                <span>{formatCurrency(totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA</span>
                <span>{formatCurrency(totalTVA)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total TTC</span>
                <span>{formatCurrency(totalTTC)}</span>
              </div>
            </div>
            <Button type="submit" disabled={loading}>{loading ? "Création..." : "Créer la facture"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
