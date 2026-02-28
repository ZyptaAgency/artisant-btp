"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, LayoutGrid, List, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUT_STYLES: Record<string, string> = {
  BROUILLON: "bg-slate-100 text-slate-600",
  ENVOYE: "bg-zypta-blue/15 text-zypta-blue",
  ACCEPTE: "bg-emerald-500/15 text-emerald-600 animate-pulse",
  REFUSE: "bg-red-100 text-red-600 line-through",
  EXPIRE: "bg-orange-100 text-orange-600",
};

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
  EXPIRE: "Expiré",
};

const TEMPLATES = [
  { id: "sdb", label: "Rénovation salle de bain", emoji: "🚿" },
  { id: "extension", label: "Extension maison", emoji: "🏠" },
  { id: "ravalement", label: "Ravalement façade", emoji: "🏗️" },
];

type Devis = {
  id: string;
  numero: string;
  montantTTC: number;
  statut: string;
  dateValidite: string | null;
  createdAt: string;
  client: { prenom: string; nom: string };
};

export function DevisZypta() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vueCards, setVueCards] = useState(true);

  useEffect(() => {
    fetch("/api/devis")
      .then((r) => r.json())
      .then((data) => {
        setDevis(data);
        setLoading(false);
      });
  }, []);

  const filtered = devis.filter(
    (d) =>
      d.numero.toLowerCase().includes(search.toLowerCase()) ||
      `${d.client.prenom} ${d.client.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Devis</h1>
          <p className="text-slate-600">Créez des devis pro en 2 minutes</p>
        </div>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Templates rapides */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <Button key={t.id} variant="outline" size="sm" asChild>
            <Link
              href={`/devis/nouveau?template=${t.id}`}
              className="rounded-xl border-slate-200 transition-all hover:border-zypta-blue/50 hover:bg-zypta-blue/5"
            >
              <span className="mr-2">{t.emoji}</span>
              {t.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Barre de recherche + toggle vue */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher par numéro, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-10"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setVueCards(true)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              vueCards ? "bg-zypta-blue text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVueCards(false)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              !vueCards ? "bg-zypta-blue text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16">
          <FileText className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">Aucun devis trouvé</p>
          <Button className="mt-4" asChild>
            <Link href="/devis/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Créer un devis
            </Link>
          </Button>
        </div>
      ) : vueCards ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.id}
              href={`/devis/${d.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-zypta-blue/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{d.numero}</p>
                  <p className="text-sm text-slate-600">
                    {d.client.prenom} {d.client.nom}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUT_STYLES[d.statut] ?? "bg-slate-100 text-slate-600"
                  )}
                >
                  {STATUT_LABELS[d.statut] ?? d.statut}
                </span>
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900">
                {formatCurrency(d.montantTTC)}
              </p>
              <p className="text-xs text-slate-500">
                Validité : {d.dateValidite ? formatDate(d.dateValidite) : "—"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Montant TTC</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Validité</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/devis/${d.id}`}
                      className="font-medium text-zypta-blue hover:underline"
                    >
                      {d.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {d.client.prenom} {d.client.nom}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(d.montantTTC)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUT_STYLES[d.statut] ?? "bg-slate-100 text-slate-600"
                      )}
                    >
                      {STATUT_LABELS[d.statut] ?? d.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.dateValidite ? formatDate(d.dateValidite) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/devis/${d.id}`}>Voir</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
