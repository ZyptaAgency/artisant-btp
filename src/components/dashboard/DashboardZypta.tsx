"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Euro,
  FileText,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Send,
  Sun,
} from "lucide-react";
import Link from "next/link";

type Chantier = {
  id: string;
  nom: string;
  statut: string;
  dateDebut: string | null;
  dateFin: string | null;
  avancement: number;
};

type DevisRelance = {
  id: string;
  numero: string;
  client: string;
  dateValidite: string | null;
};

type FactureRetard = {
  id: string;
  numero: string;
  client: string;
  dateEcheance: string | null;
  retardJours: number;
};

type FactureEnvoyer = {
  id: string;
  numero: string;
  client: string;
};

type Props = {
  prenom: string;
  caMois: number;
  evolutionCA: number;
  devisEnAttente: number;
  facturesImpayees: number;
  facturesRetard30: number;
  tauxConversion: number;
  chantiers: Chantier[];
  devisARelancer: DevisRelance[];
  facturesEnRetard: FactureRetard[];
  facturesAEnvoyer: FactureEnvoyer[];
};

const salutations = [
  "belle journée pour closer 💰",
  "prêt à enchaîner les chantiers ?",
  "la journée s'annonce productive !",
  "c'est parti pour une bonne journée !",
];

export function DashboardZypta({
  prenom,
  caMois,
  evolutionCA,
  devisEnAttente,
  facturesImpayees,
  facturesRetard30,
  tauxConversion,
  chantiers,
  devisARelancer,
  facturesEnRetard,
  facturesAEnvoyer,
}: Props) {
  const salutation = salutations[new Date().getHours() % salutations.length];

  return (
    <div className="space-y-6">
      {/* Header avec salutation + météo placeholder */}
      <div className="dashboard-card relative overflow-hidden rounded-zypta bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-6 shadow-zypta ring-1 ring-supernova/20">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-supernova/10" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-supernova/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-supernova">
              Salut {prenom}, {salutation}
            </h1>
            <p className="mt-1 text-slate-400">
              Vue d&apos;ensemble de ton activité en un coup d&apos;œil
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 shadow-sm ring-1 ring-supernova/20">
            <Sun className="h-5 w-5 text-supernova" />
            <span className="text-sm font-medium text-slate-200">Ensoleillé, 18°C</span>
            <span className="text-xs text-slate-400">Paris</span>
          </div>
        </div>
      </div>

      {/* KPIs animés */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dashboard-card group rounded-zypta border border-slate-700 bg-slate-800/80 p-5 shadow-zypta transition-all duration-300 hover:shadow-zypta-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-supernova/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">CA du mois</span>
            <Euro className="h-5 w-5 text-supernova opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-supernova">{formatCurrency(caMois)}</p>
          <p className={`mt-1 text-sm font-medium ${evolutionCA >= 0 ? "text-green-600" : "text-red-600"}`}>
            {evolutionCA >= 0 ? "+" : ""}{evolutionCA.toFixed(1)}% vs mois dernier
          </p>
        </div>

        <div className="dashboard-card group rounded-zypta border border-slate-700 bg-slate-800/80 p-5 shadow-zypta transition-all duration-300 hover:shadow-zypta-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-supernova/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Devis en attente</span>
            <FileText className="h-5 w-5 text-supernova opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{devisEnAttente}</p>
          <Link href="/devis" className="mt-1 text-sm font-medium text-supernova hover:underline">
            Voir les devis →
          </Link>
        </div>

        <div className="dashboard-card group rounded-zypta border border-slate-700 bg-slate-800/80 p-5 shadow-zypta transition-all duration-300 hover:shadow-zypta-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-supernova/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Factures impayées</span>
            <Receipt className="h-5 w-5 text-supernova opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{facturesImpayees}</p>
          {facturesRetard30 > 0 && (
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-red-600 animate-pulse-soft">
              <AlertTriangle className="h-4 w-4" />
              {facturesRetard30} en retard &gt; 30j
            </p>
          )}
        </div>

        <div className="dashboard-card group rounded-zypta border border-slate-700 bg-slate-800/80 p-5 shadow-zypta transition-all duration-300 hover:shadow-zypta-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-supernova/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Taux conversion</span>
            <TrendingUp className="h-5 w-5 text-supernova opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{tauxConversion.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-slate-400">Devis → Chantier</p>
        </div>
      </div>

      {/* Timeline chantiers */}
      {chantiers.length > 0 && (
        <div className="dashboard-card rounded-zypta border border-slate-700 bg-slate-800/80 p-6 shadow-zypta ring-1 ring-supernova/10">
          <h2 className="text-lg font-bold text-supernova">Chantiers en cours</h2>
          <p className="text-sm text-slate-400">Frise des chantiers avec avancement</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {chantiers.map((c) => (
              <div
                key={c.id}
                className="min-w-[200px] flex-shrink-0 rounded-xl border border-slate-600 p-4 transition-all hover:ring-1 hover:ring-supernova/30"
              >
                <p className="font-medium text-slate-100">{c.nom}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      c.statut === "TERMINE"
                        ? "bg-green-500"
                        : c.statut === "EN_COURS"
                        ? "bg-supernova"
                        : "bg-supernova/50 animate-pulse-soft"
                    }`}
                    style={{ width: `${c.avancement || 50}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {c.dateDebut ? formatDate(c.dateDebut) : "À planifier"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions urgentes */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="dashboard-card rounded-zypta border border-slate-700 bg-slate-800/80 p-6 shadow-zypta ring-1 ring-supernova/10">
          <h3 className="flex items-center gap-2 font-bold text-supernova">
            <AlertTriangle className="h-5 w-5 text-supernova" />
            Devis à relancer
          </h3>
          <div className="mt-4 space-y-3">
            {devisARelancer.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun devis à relancer</p>
            ) : (
              devisARelancer.map((d) => (
                <Link
                  key={d.id}
                  href={`/devis/${d.id}`}
                  className="block rounded-lg border border-slate-600 p-3 transition-all hover:ring-1 hover:ring-supernova/30"
                >
                  <p className="font-medium">{d.numero}</p>
                  <p className="text-sm text-slate-500">{d.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card rounded-zypta border border-slate-700 bg-slate-800/80 p-6 shadow-zypta ring-1 ring-supernova/10">
          <h3 className="flex items-center gap-2 font-bold text-supernova">
            <Send className="h-5 w-5 text-supernova" />
            Factures à envoyer
          </h3>
          <div className="mt-4 space-y-3">
            {facturesAEnvoyer.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune facture en attente</p>
            ) : (
              facturesAEnvoyer.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className="block rounded-lg border border-slate-600 p-3 transition-all hover:ring-1 hover:ring-supernova/30"
                >
                  <p className="font-medium">{f.numero}</p>
                  <p className="text-sm text-slate-500">{f.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-zypta border border-slate-200/80 bg-white p-6 shadow-zypta">
          <h3 className="flex items-center gap-2 font-bold text-red-600">
            <Receipt className="h-5 w-5" />
            Factures en retard
          </h3>
          <div className="mt-4 space-y-3">
            {facturesEnRetard.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune facture en retard</p>
            ) : (
              facturesEnRetard.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className={`block rounded-lg border p-3 transition-all hover:bg-red-50 ${
                    f.retardJours > 30 ? "border-red-200 animate-pulse-soft" : "border-orange-200"
                  }`}
                >
                  <p className="font-medium">{f.numero}</p>
                  <p className="text-sm text-slate-500">{f.client}</p>
                  <p className="text-xs text-red-600">Retard +{f.retardJours}j</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mini calendrier placeholder */}
      <div className="dashboard-card rounded-zypta border border-slate-700 bg-slate-800/80 p-6 shadow-zypta ring-1 ring-supernova/10">
        <h3 className="font-bold text-supernova">Cette semaine</h3>
        <div className="mt-4 flex gap-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j, i) => (
            <div
              key={j}
              className="flex flex-1 flex-col items-center rounded-lg border border-slate-600 p-2"
            >
              <span className="text-xs text-slate-400">{j}</span>
              <span className="mt-1 text-lg font-bold text-slate-100">{i + 18}</span>
              <div className="mt-2 flex gap-1">
                {i === 2 && <span className="h-2 w-2 rounded-full bg-supernova" />}
                {i === 4 && <span className="h-2 w-2 rounded-full bg-supernova/70" />}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          🔵 RDV client · 🟠 Chantier · ⚪ Administratif
        </p>
      </div>
    </div>
  );
}
