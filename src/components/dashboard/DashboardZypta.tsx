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
import { motion } from "framer-motion";

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

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="glass-card relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-nova-mid/10" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-nova-outer/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              Salut {prenom}, {salutation}
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">
              Vue d&apos;ensemble de ton activité en un coup d&apos;œil
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] px-4 py-2 shadow-sm border border-[var(--border)]">
            <Sun className="h-5 w-5 text-nova-core" />
            <span className="text-sm font-medium text-[var(--text-white)]">Ensoleillé, 18°C</span>
            <span className="text-xs text-[var(--text-muted)]">Paris</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">CA du mois</span>
            <Euro className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold gradient-text">{formatCurrency(caMois)}</p>
          <p className={`mt-1 text-sm font-medium ${evolutionCA >= 0 ? "text-green-400" : "text-red-400"}`}>
            {evolutionCA >= 0 ? "+" : ""}{evolutionCA.toFixed(1)}% vs mois dernier
          </p>
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Devis en attente</span>
            <FileText className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{devisEnAttente}</p>
          <Link href="/devis" className="mt-1 text-sm font-medium text-nova-mid hover:underline">
            Voir les devis →
          </Link>
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Factures impayées</span>
            <Receipt className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{facturesImpayees}</p>
          {facturesRetard30 > 0 && (
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-red-400 animate-pulse-soft">
              <AlertTriangle className="h-4 w-4" />
              {facturesRetard30} en retard &gt; 30j
            </p>
          )}
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">Taux conversion</span>
            <TrendingUp className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{tauxConversion.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Devis → Chantier</p>
        </div>
      </motion.div>

      {chantiers.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-bold gradient-text">Chantiers en cours</h2>
          <p className="text-sm text-[var(--text-muted)]">Frise des chantiers avec avancement</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {chantiers.map((c) => (
              <div
                key={c.id}
                className="min-w-[200px] flex-shrink-0 rounded-xl border border-[var(--border)] p-4 transition-all hover:border-nova-mid/30 hover:shadow-[0_0_20px_rgba(200,75,255,0.15)]"
              >
                <p className="font-medium text-[var(--text-white)]">{c.nom}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      c.statut === "TERMINE"
                        ? "bg-green-500"
                        : c.statut === "EN_COURS"
                        ? "bg-nova-mid"
                        : "bg-nova-mid/50 animate-pulse-soft"
                    }`}
                    style={{ width: `${c.avancement || 50}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {c.dateDebut ? formatDate(c.dateDebut) : "À planifier"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold text-nova-mid">
            <AlertTriangle className="h-5 w-5" />
            Devis à relancer
          </h3>
          <div className="mt-4 space-y-3">
            {devisARelancer.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aucun devis à relancer</p>
            ) : (
              devisARelancer.map((d) => (
                <Link
                  key={d.id}
                  href={`/devis/${d.id}`}
                  className="block rounded-lg border border-[var(--border)] p-3 transition-all hover:border-nova-mid/30"
                >
                  <p className="font-medium text-[var(--text-white)]">{d.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{d.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold text-nova-mid">
            <Send className="h-5 w-5" />
            Factures à envoyer
          </h3>
          <div className="mt-4 space-y-3">
            {facturesAEnvoyer.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aucune facture en attente</p>
            ) : (
              facturesAEnvoyer.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className="block rounded-lg border border-[var(--border)] p-3 transition-all hover:border-nova-mid/30"
                >
                  <p className="font-medium text-[var(--text-white)]">{f.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{f.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 !border-red-500/20">
          <h3 className="flex items-center gap-2 font-bold text-red-400">
            <Receipt className="h-5 w-5" />
            Factures en retard
          </h3>
          <div className="mt-4 space-y-3">
            {facturesEnRetard.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aucune facture en retard</p>
            ) : (
              facturesEnRetard.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className={`block rounded-lg border p-3 transition-all hover:border-red-400/40 ${
                    f.retardJours > 30 ? "border-red-500/50 animate-pulse-soft" : "border-orange-500/50"
                  }`}
                >
                  <p className="font-medium text-[var(--text-white)]">{f.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{f.client}</p>
                  <p className="text-xs text-red-400">Retard +{f.retardJours}j</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card p-6">
        <h3 className="font-bold gradient-text">Cette semaine</h3>
        <div className="mt-4 flex gap-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j, i) => (
            <div
              key={j}
              className="flex flex-1 flex-col items-center rounded-lg border border-[var(--border)] p-2"
            >
              <span className="text-xs text-[var(--text-muted)]">{j}</span>
              <span className="mt-1 text-lg font-bold text-[var(--text-white)]">{i + 18}</span>
              <div className="mt-2 flex gap-1">
                {i === 2 && <span className="h-2 w-2 rounded-full bg-nova-mid" />}
                {i === 4 && <span className="h-2 w-2 rounded-full bg-nova-outer" />}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          🟣 RDV client · 🟠 Chantier · ⚪ Administratif
        </p>
      </motion.div>
    </motion.div>
  );
}
