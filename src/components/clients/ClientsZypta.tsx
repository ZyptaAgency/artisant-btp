"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Phone,
  FileText,
  Receipt,
  Calendar,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClientFormQuickAdd } from "./ClientFormQuickAdd";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-zypta-blue/20 text-zypta-blue",
  "bg-zypta-orange/20 text-zypta-orange",
  "bg-emerald-500/20 text-emerald-600",
  "bg-violet-500/20 text-violet-600",
  "bg-rose-500/20 text-rose-600",
];

const STATUT_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTE: "Contacté",
  DEVIS_ENVOYE: "Devis envoyé",
  NEGOCIATION: "Négociation",
  SIGNE: "Signé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  PERDU: "Perdu",
};

type ClientWithStats = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresseChantier: string | null;
  statutPipeline: string;
  createdAt: string;
  updatedAt: string;
  factures?: { montantTTC: number; updatedAt: string }[];
  devis?: { updatedAt: string }[];
};

function getInitials(prenom: string, nom: string) {
  return `${(prenom?.[0] ?? "").toUpperCase()}${(nom?.[0] ?? "").toUpperCase()}`.slice(0, 2);
}

function getAvatarColor(id: string) {
  const idx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getScoreChaleur(client: ClientWithStats): "hot" | "warm" | "cold" {
  const dates: Date[] = [
    ...(client.factures ?? []).map((f) => new Date(f.updatedAt)),
    ...(client.devis ?? []).map((d) => new Date(d.updatedAt)),
    new Date(client.updatedAt),
  ];
  const lastActivity = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date(client.createdAt);
  const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 14) return "hot";
  if (daysSince <= 90) return "warm";
  return "cold";
}

function getDernierContact(client: ClientWithStats): string | null {
  const dates: Date[] = [
    ...(client.factures ?? []).map((f) => new Date(f.updatedAt)),
    ...(client.devis ?? []).map((d) => new Date(d.updatedAt)),
  ];
  if (dates.length === 0) return null;
  const last = new Date(Math.max(...dates.map((d) => d.getTime())));
  const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return formatDate(last.toISOString());
}

function getMontantTotal(client: ClientWithStats): number {
  return (client.factures ?? []).reduce((s, f) => s + f.montantTTC, 0);
}

export function ClientsZypta() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [panelClient, setPanelClient] = useState<ClientWithStats | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  async function fetchClients() {
    const res = await fetch("/api/clients?extended=1");
    if (res.ok) {
      const data = await res.json();
      setClients(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      `${c.prenom} ${c.nom}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.telephone ?? "").includes(q) ||
      (c.adresseChantier ?? "").toLowerCase().includes(q);
    if (!matchSearch) return false;

    if (filter === "prospect") return c.statutPipeline === "PROSPECT";
    if (filter === "actif") return ["SIGNE", "EN_COURS", "TERMINE"].includes(c.statutPipeline);
    if (filter === "vip") return getMontantTotal(c) >= 5000;
    if (filter === "dormant") {
      const dernier = getDernierContact(c);
      if (!dernier) return true;
      const dates = [
        ...(c.factures ?? []).map((f) => new Date(f.updatedAt)),
        ...(c.devis ?? []).map((d) => new Date(d.updatedAt)),
      ];
      const last = dates.length ? Math.max(...dates.map((d) => d.getTime())) : new Date(c.createdAt).getTime();
      return (Date.now() - last) / (1000 * 60 * 60 * 24) > 180;
    }
    return true;
  });

  const chips = [
    { id: "prospect", label: "Prospect" },
    { id: "actif", label: "Client actif" },
    { id: "vip", label: "VIP" },
    { id: "dormant", label: "Dormant 6 mois" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-600">Votre portefeuille clients en un coup d&apos;œil</p>
      </div>

      {/* Barre de recherche XL */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Rechercher par nom, adresse, téléphone, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-2xl border-slate-200 pl-12 text-base shadow-sm transition-all duration-300 focus:border-zypta-blue focus:ring-2 focus:ring-zypta-blue/20"
        />
      </div>

      {/* Filtres chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(filter === chip.id ? null : chip.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              filter === chip.id
                ? "bg-zypta-blue text-white shadow-md"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-zypta-blue/50"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Grille de cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16">
          <p className="text-slate-500">Aucun client trouvé</p>
          <Button className="mt-4" onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((client) => {
            const score = getScoreChaleur(client);
            const montant = getMontantTotal(client);
            const dernier = getDernierContact(client);
            return (
              <div
                key={client.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-zypta-blue/5"
                onClick={() => setPanelClient(client)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold",
                        getAvatarColor(client.id)
                      )}
                    >
                      {getInitials(client.prenom, client.nom)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {client.prenom} {client.nom}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dernier ?? "Jamais contacté"} • {STATUT_LABELS[client.statutPipeline] ?? client.statutPipeline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {score === "hot" && <span className="text-lg">🔥🔥🔥</span>}
                    {score === "warm" && <span className="text-lg">🔥</span>}
                    {score === "cold" && <span className="text-lg">❄️</span>}
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Total facturé : {formatCurrency(montant)}
                </p>

                {/* Quick actions au survol */}
                <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {client.telephone && (
                    <a
                      href={`tel:${client.telephone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-zypta-blue/10 text-zypta-blue transition-colors hover:bg-zypta-blue/20"
                      title="Appeler"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/devis/nouveau?clientId=${client.id}`);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-zypta-blue/10 hover:text-zypta-blue"
                    title="Envoyer un devis"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/factures/nouvelle?clientId=${client.id}`);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-zypta-blue/10 hover:text-zypta-blue"
                    title="Créer une facture"
                  >
                    <Receipt className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/clients/${client.id}`);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-zypta-blue/10 hover:text-zypta-blue"
                    title="Voir fiche"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>

                <ChevronRight className="absolute right-3 top-4 h-5 w-5 text-slate-300 group-hover:text-zypta-blue" />
              </div>
            );
          })}
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zypta-blue to-zypta-blue/90 text-white shadow-lg shadow-zypta-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Slide panel fiche client */}
      {panelClient && (
        <ClientSlidePanel client={panelClient} onClose={() => setPanelClient(null)} />
      )}

      <ClientFormQuickAdd
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchClients();
        }}
      />
    </div>
  );
}

function ClientSlidePanel({
  client,
  onClose,
}: {
  client: ClientWithStats;
  onClose: () => void;
}) {
  const router = useRouter();
  const montant = getMontantTotal(client);
  const dernier = getDernierContact(client);
  const score = getScoreChaleur(client);
  const joursDepuisContact = (() => {
    const dates = [
      ...(client.factures ?? []).map((f) => new Date(f.updatedAt)),
      ...(client.devis ?? []).map((d) => new Date(d.updatedAt)),
    ];
    if (dates.length === 0) return 999;
    const last = Math.max(...dates.map((d) => d.getTime()));
    return Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
  })();

  const suggestion =
    joursDepuisContact > 45
      ? "Ce client n'a pas été relancé depuis 45 jours. Son dernier chantier était une rénovation cuisine — proposez-lui la salle de bain ? 🚿"
      : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-900">Fiche client</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-bold text-xl",
                getAvatarColor(client.id)
              )}
            >
              {getInitials(client.prenom, client.nom)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {client.prenom} {client.nom}
              </h3>
              <p className="text-slate-600">{client.email}</p>
              <p className="text-sm text-slate-500">
                {dernier ?? "Jamais contacté"} • {formatCurrency(montant)} facturé
              </p>
              <div className="mt-1">
                {score === "hot" && <span>🔥🔥🔥 Chaud</span>}
                {score === "warm" && <span>🔥 Tiède</span>}
                {score === "cold" && <span>❄️ Froid</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {client.telephone && (
              <a
                href={`tel:${client.telephone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-zypta-blue/10 px-4 py-2 text-zypta-blue transition-colors hover:bg-zypta-blue/20"
              >
                <Phone className="h-4 w-4" />
                Appeler
              </a>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/devis/nouveau?clientId=${client.id}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Devis
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/factures/nouvelle?clientId=${client.id}`)}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Facture
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(`/clients/${client.id}`)}>
              <ChevronRight className="mr-2 h-4 w-4" />
              Fiche complète
            </Button>
          </div>

          {client.adresseChantier && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700">Adresse chantier</h4>
              <p className="text-slate-600">{client.adresseChantier}</p>
            </div>
          )}

          {suggestion && (
            <div className="mt-6 rounded-2xl border border-zypta-blue/20 bg-zypta-blue/5 p-4">
              <div className="flex items-center gap-2 text-zypta-blue">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Suggestion Zypta</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
