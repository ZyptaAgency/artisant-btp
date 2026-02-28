"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Receipt, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUT_STYLES: Record<string, string> = {
  BROUILLON: "bg-white/5 text-[var(--text-muted)]",
  ENVOYEE: "bg-nova-mid/15 text-nova-mid",
  PAYEE: "bg-emerald-500/15 text-emerald-600",
  EN_RETARD: "bg-orange-100 text-orange-600",
};

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ENVOYEE: "Envoyée",
  PAYEE: "Payée ✅",
  EN_RETARD: "En retard",
};

type Facture = {
  id: string;
  numero: string;
  montantTTC: number;
  statut: string;
  dateEcheance: string | null;
  createdAt: string;
  updatedAt: string;
  client: { prenom: string; nom: string };
};

function getCountdown(dateEcheance: string | null): { label: string; className: string } | null {
  if (!dateEcheance) return null;
  const echeance = new Date(dateEcheance);
  const now = new Date();
  const diffMs = echeance.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Retard +${Math.abs(diffDays)}j`, className: "text-red-600 font-semibold" };
  }
  if (diffDays === 0) return { label: "Aujourd'hui", className: "text-orange-600 font-medium" };
  if (diffDays <= 3) return { label: `J-${diffDays}`, className: "text-orange-600 font-medium" };
  return { label: `J-${diffDays}`, className: "text-[var(--text-muted)]" };
}

export function FacturesZypta() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/factures")
      .then((r) => r.json())
      .then((data) => {
        setFactures(data);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const aEncaisser = factures
    .filter((f) => f.statut === "ENVOYEE" || f.statut === "EN_RETARD")
    .reduce((s, f) => s + f.montantTTC, 0);

  const encaisseCeMois = factures
    .filter(
      (f) =>
        f.statut === "PAYEE" &&
        new Date(f.updatedAt) >= debutMois &&
        new Date(f.updatedAt) <= finMois
    )
    .reduce((s, f) => s + f.montantTTC, 0);

  const enRetard = factures
    .filter((f) => f.statut === "EN_RETARD")
    .reduce((s, f) => s + f.montantTTC, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Factures</h1>
          <p className="text-[var(--text-muted)]">Zéro prise de tête, zéro impayé</p>
        </div>
        <Button asChild>
          <Link href="/factures/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Link>
        </Button>
      </div>

      {/* Bandeau KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-muted)]">À encaisser</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {formatCurrency(aEncaisser)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-muted)]">Encaissé ce mois</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(encaisseCeMois)}
          </p>
        </div>
        <div
          className={cn(
            "rounded-2xl border p-4 shadow-sm",
            enRetard > 0
              ? "animate-pulse border-orange-200 bg-orange-50"
              : "border-[var(--border)] bg-[var(--bg-card)]"
          )}
        >
          <p className="text-sm font-medium text-[var(--text-muted)]">
            En retard {enRetard > 0 && "🔴"}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold",
              enRetard > 0 ? "text-orange-600" : "text-[var(--foreground)]"
            )}
          >
            {formatCurrency(enRetard)}
          </p>
        </div>
      </div>

      {/* Liste des factures */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : factures.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-white/5 py-16">
          <Receipt className="h-12 w-12 text-[var(--text-white)]" />
          <p className="mt-4 text-[var(--text-muted)]">Aucune facture</p>
          <Button className="mt-4" asChild>
            <Link href="/factures/nouvelle">
              <Plus className="mr-2 h-4 w-4" />
              Créer une facture
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {factures.map((f) => {
            const countdown = getCountdown(f.dateEcheance);
            return (
              <Link
                key={f.id}
                href={`/factures/${f.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      f.statut === "PAYEE"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-white/5 text-[var(--text-muted)]"
                    )}
                  >
                    {f.statut === "PAYEE" ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Receipt className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{f.numero}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {f.client.prenom} {f.client.nom}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-[var(--foreground)]">{formatCurrency(f.montantTTC)}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Échéance : {f.dateEcheance ? formatDate(f.dateEcheance) : "—"}
                    </p>
                    {countdown && (
                      <p className={cn("text-xs", countdown.className)}>{countdown.label}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      STATUT_STYLES[f.statut] ?? "bg-white/5 text-[var(--text-muted)]"
                    )}
                  >
                    {STATUT_LABELS[f.statut] ?? f.statut}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
