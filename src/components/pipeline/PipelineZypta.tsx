"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Check,
  BarChart3,
  LayoutGrid,
  List,
  Search,
  Phone,
  Mail,
  Eye,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  DollarSign,
  Target,
  Award,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMNS = [
  { id: "PROSPECT", title: "Premier contact", accent: "blue" },
  { id: "CONTACTE", title: "Visite programmée", accent: "violet" },
  { id: "DEVIS_ENVOYE", title: "Devis envoyé", accent: "amber" },
  { id: "NEGOCIATION", title: "Négociation", accent: "orange" },
  { id: "SIGNE", title: "Signé", accent: "emerald" },
  { id: "PERDU", title: "Perdu", accent: "red" },
] as const;

type ColumnAccent = (typeof COLUMNS)[number]["accent"];

const COLUMN_STYLES: Record<ColumnAccent, { bg: string; headerBg: string; dot: string }> = {
  blue: { bg: "bg-blue-500/[0.03]", headerBg: "bg-blue-500/10", dot: "bg-blue-400" },
  violet: { bg: "bg-violet-500/[0.03]", headerBg: "bg-violet-500/10", dot: "bg-violet-400" },
  amber: { bg: "bg-amber-500/[0.03]", headerBg: "bg-amber-500/10", dot: "bg-amber-400" },
  orange: { bg: "bg-orange-500/[0.03]", headerBg: "bg-orange-500/10", dot: "bg-orange-400" },
  emerald: { bg: "bg-emerald-500/[0.03]", headerBg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  red: { bg: "bg-red-500/[0.03]", headerBg: "bg-red-500/10", dot: "bg-red-400" },
};

const TYPE_BADGES: Record<string, { label: string; icon: string; color: string }> = {
  renovation: { label: "Rénovation", icon: "🏠", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  depannage: { label: "Dépannage", icon: "🔧", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  construction: { label: "Construction", icon: "🏗️", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

type ViewMode = "kanban" | "funnel" | "list";
type SortKey = "date" | "amount" | "probability";
type AmountRange = "all" | "<5k" | "5k-20k" | "20k-50k" | ">50k";
type TypeFilter = "tous" | "renovation" | "depannage" | "construction";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClientWithDevis = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statutPipeline: string;
  notes: string | null;
  updatedAt: string;
  devis?: { montantTTC: number; updatedAt: string }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeProjet(notes: string | null): string {
  if (!notes) return "renovation";
  const n = notes.toLowerCase();
  if (n.includes("dépannage") || n.includes("depannage")) return "depannage";
  if (n.includes("construction") || n.includes("extension")) return "construction";
  return "renovation";
}

function getMontantEstime(client: ClientWithDevis): number {
  const devis = client.devis ?? [];
  if (devis.length === 0) return 0;
  return Math.max(...devis.map((d) => d.montantTTC));
}

function getDernierContact(client: ClientWithDevis): Date {
  const devis = client.devis ?? [];
  if (devis.length === 0) return new Date(client.updatedAt);
  return new Date(Math.max(...devis.map((d) => new Date(d.updatedAt).getTime())));
}

function getJoursSansActivite(client: ClientWithDevis): number {
  const last = getDernierContact(client);
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function getProbabilite(statut: string): number {
  const map: Record<string, number> = {
    PROSPECT: 10,
    CONTACTE: 25,
    DEVIS_ENVOYE: 50,
    NEGOCIATION: 65,
    SIGNE: 100,
    PERDU: 0,
  };
  return map[statut] ?? 30;
}

function matchAmountRange(amount: number, range: AmountRange): boolean {
  switch (range) {
    case "all": return true;
    case "<5k": return amount < 5000;
    case "5k-20k": return amount >= 5000 && amount <= 20000;
    case "20k-50k": return amount > 20000 && amount <= 50000;
    case ">50k": return amount > 50000;
  }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M €`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k €`;
  return `${n.toFixed(0)} €`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PipelineZypta() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithDevis[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("kanban");
  const [factureModal, setFactureModal] = useState<{ clientId: string; nom: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("tous");
  const [amountRange, setAmountRange] = useState<AmountRange>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  useEffect(() => {
    fetch("/api/clients?extended=1")
      .then((r) => r.json())
      .then((data) => {
        setClients(
          data.filter((c: ClientWithDevis) =>
            COLUMNS.some((col) => col.id === c.statutPipeline)
          )
        );
        setLoading(false);
      });
  }, []);

  // Filtered + sorted clients
  const filtered = useMemo(() => {
    let result = clients.filter((c) => {
      const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
      if (search && !fullName.includes(search.toLowerCase())) return false;
      if (typeFilter !== "tous" && getTypeProjet(c.notes) !== typeFilter) return false;
      if (!matchAmountRange(getMontantEstime(c), amountRange)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "date":
          return getDernierContact(b).getTime() - getDernierContact(a).getTime();
        case "amount":
          return getMontantEstime(b) - getMontantEstime(a);
        case "probability":
          return getProbabilite(b.statutPipeline) - getProbabilite(a.statutPipeline);
        default:
          return 0;
      }
    });

    return result;
  }, [clients, search, typeFilter, amountRange, sortKey]);

  const clientsByColumn = useMemo(
    () =>
      COLUMNS.reduce(
        (acc, col) => {
          acc[col.id] = filtered.filter((c) => c.statutPipeline === col.id);
          return acc;
        },
        {} as Record<string, ClientWithDevis[]>
      ),
    [filtered]
  );

  const montantsByColumn = useMemo(
    () =>
      COLUMNS.reduce(
        (acc, col) => {
          acc[col.id] = (clientsByColumn[col.id] ?? []).reduce(
            (s, c) => s + getMontantEstime(c),
            0
          );
          return acc;
        },
        {} as Record<string, number>
      ),
    [clientsByColumn]
  );

  // Stats
  const stats = useMemo(() => {
    const totalValue = Object.values(montantsByColumn).reduce((a, b) => a + b, 0);
    const weighted = COLUMNS.reduce((acc, col) => {
      const proba = getProbabilite(col.id) / 100;
      return acc + (montantsByColumn[col.id] ?? 0) * proba;
    }, 0);
    const signeCount = (clientsByColumn["SIGNE"] ?? []).length;
    const perduCount = (clientsByColumn["PERDU"] ?? []).length;
    const winRate = signeCount + perduCount > 0 ? (signeCount / (signeCount + perduCount)) * 100 : 0;
    const dealsWithAmount = filtered.filter((c) => getMontantEstime(c) > 0);
    const avgDeal =
      dealsWithAmount.length > 0
        ? dealsWithAmount.reduce((s, c) => s + getMontantEstime(c), 0) / dealsWithAmount.length
        : 0;
    return { totalValue, weighted, winRate, avgDeal };
  }, [montantsByColumn, clientsByColumn, filtered]);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const clientId = result.draggableId;
    const newStatut = result.destination.droppableId;
    const client = clients.find((c) => c.id === clientId);
    if (!client || client.statutPipeline === newStatut) return;

    const res = await fetch(`/api/clients/${clientId}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });

    if (res.ok) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, statutPipeline: newStatut } : c))
      );
      if (newStatut === "SIGNE") {
        setFactureModal({ clientId, nom: `${client.prenom} ${client.nom}` });
      }
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/5" />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 flex-1 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="h-96 w-72 shrink-0 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pipeline</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {filtered.length} deal{filtered.length > 1 ? "s" : ""} en cours
          </p>
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: "kanban", label: "Kanban", icon: LayoutGrid },
              { key: "funnel", label: "Funnel", icon: BarChart3 },
              { key: "list", label: "Liste", icon: List },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={view === key ? "default" : "outline"}
              size="sm"
              onClick={() => setView(key)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <FilterSelect
          icon={<Filter className="h-3.5 w-3.5" />}
          label="Type"
          value={typeFilter}
          options={[
            { value: "tous", label: "Tous" },
            { value: "renovation", label: "🏠 Rénovation" },
            { value: "depannage", label: "🔧 Dépannage" },
            { value: "construction", label: "🏗️ Construction" },
          ]}
          onChange={(v) => setTypeFilter(v as TypeFilter)}
        />

        <FilterSelect
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="Montant"
          value={amountRange}
          options={[
            { value: "all", label: "Tous" },
            { value: "<5k", label: "< 5 000 €" },
            { value: "5k-20k", label: "5k – 20k €" },
            { value: "20k-50k", label: "20k – 50k €" },
            { value: ">50k", label: "> 50 000 €" },
          ]}
          onChange={(v) => setAmountRange(v as AmountRange)}
        />

        <FilterSelect
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
          label="Tri"
          value={sortKey}
          options={[
            { value: "date", label: "Date" },
            { value: "amount", label: "Montant" },
            { value: "probability", label: "Probabilité" },
          ]}
          onChange={(v) => setSortKey(v as SortKey)}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={DollarSign} label="Pipeline total" value={formatCompact(stats.totalValue)} />
        <StatCard icon={Target} label="Pipeline pondéré" value={formatCompact(stats.weighted)} />
        <StatCard icon={Award} label="Taux de succès" value={`${stats.winRate.toFixed(0)}%`} />
        <StatCard icon={TrendingDown} label="Deal moyen" value={formatCompact(stats.avgDeal)} />
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {view === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanView
              clientsByColumn={clientsByColumn}
              montantsByColumn={montantsByColumn}
              onDragEnd={handleDragEnd}
              onCardClick={(id) => router.push(`/clients/${id}`)}
            />
          </motion.div>
        )}
        {view === "funnel" && (
          <motion.div
            key="funnel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <FunnelView clientsByColumn={clientsByColumn} montantsByColumn={montantsByColumn} />
          </motion.div>
        )}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ListView
              clients={filtered}
              sortKey={sortKey}
              onSortChange={setSortKey}
              onCardClick={(id) => router.push(`/clients/${id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facture dialog */}
      {factureModal && (
        <Dialog open={!!factureModal} onOpenChange={(open) => !open && setFactureModal(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Créer la facture</DialogTitle>
            </DialogHeader>
            <p className="text-[var(--text-muted)]">
              Le deal avec <strong>{factureModal.nom}</strong> est signé.
              Souhaitez-vous créer la facture correspondante ?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFactureModal(null)}>
                Plus tard
              </Button>
              <Button onClick={() => router.push(`/factures/nouvelle?clientId=${factureModal.clientId}`)}>
                <Check className="mr-2 h-4 w-4" />
                Créer la facture
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter select (inline dropdown)
// ---------------------------------------------------------------------------

function FilterSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--ring)]"
      >
        {icon}
        <span className="text-[var(--text-muted)]">{label}:</span>
        <span className="font-medium">{selected?.label}</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-1 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--bg-elevated,var(--bg-card))] p-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  opt.value === value
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:bg-white/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-xl p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
        <Icon className="h-5 w-5 text-[var(--accent)]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-[var(--text-muted)]">{label}</p>
        <p className="gradient-text truncate text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal Card (shared between Kanban and other views)
// ---------------------------------------------------------------------------

function DealCard({
  client,
  onClick,
  isDragging,
}: {
  client: ClientWithDevis;
  onClick: () => void;
  isDragging?: boolean;
}) {
  const jours = getJoursSansActivite(client);
  const stagnant = jours >= 7;
  const proba = getProbabilite(client.statutPipeline);
  const typeKey = getTypeProjet(client.notes);
  const type = TYPE_BADGES[typeKey] ?? TYPE_BADGES.renovation;
  const montant = getMontantEstime(client);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-grab rounded-xl border bg-[var(--bg-card)] p-3 shadow-sm transition-all duration-200 active:cursor-grabbing",
        isDragging && "shadow-lg ring-2 ring-[var(--accent)]/40",
        stagnant
          ? "border-orange-400/60 ring-1 ring-orange-400/20"
          : "border-[var(--border)] hover:border-[var(--ring)]"
      )}
    >
      {/* Stagnant warning */}
      {stagnant && (
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-orange-400">
          <AlertTriangle className="h-3 w-3" />
          À relancer ({jours}j)
        </div>
      )}

      {/* Client name */}
      <p className="font-semibold text-[var(--foreground)]">
        {client.prenom} {client.nom}
      </p>

      {/* Amount */}
      <p className={cn("mt-1 text-sm font-bold", montant >= 20000 ? "gradient-text" : "text-[var(--foreground)]")}>
        {formatCurrency(montant)}
      </p>

      {/* Type badge + days */}
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", type.color)}>
          {type.icon} {type.label}
        </span>
        <span
          className={cn(
            "text-[11px]",
            jours > 14 ? "text-red-400" : jours > 7 ? "text-orange-400" : "text-[var(--text-muted)]"
          )}
        >
          {jours === 0 ? "Aujourd'hui" : `${jours}j`}
        </span>
      </div>

      {/* Probability bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              proba >= 70 && "bg-emerald-500",
              proba >= 30 && proba < 70 && "bg-amber-500",
              proba < 30 && proba > 0 && "bg-red-400",
              proba === 0 && "bg-[var(--text-muted)]"
            )}
            style={{ width: `${proba}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-[var(--text-muted)]">{proba}%</span>
      </div>

      {/* Quick actions on hover */}
      <div className="mt-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <QuickAction icon={Phone} label="Appeler" onClick={(e) => { e.stopPropagation(); if (client.telephone) window.open(`tel:${client.telephone}`); }} />
        <QuickAction icon={Mail} label="Email" onClick={(e) => { e.stopPropagation(); if (client.email) window.open(`mailto:${client.email}`); }} />
        <QuickAction icon={Eye} label="Voir" onClick={(e) => { e.stopPropagation(); onClick(); }} />
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Kanban View
// ---------------------------------------------------------------------------

function KanbanView({
  clientsByColumn,
  montantsByColumn,
  onDragEnd,
  onCardClick,
}: {
  clientsByColumn: Record<string, ClientWithDevis[]>;
  montantsByColumn: Record<string, number>;
  onDragEnd: (result: DropResult) => void;
  onCardClick: (id: string) => void;
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const style = COLUMN_STYLES[col.accent];
          const count = (clientsByColumn[col.id] ?? []).length;
          const total = montantsByColumn[col.id] ?? 0;

          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "w-80 shrink-0 rounded-2xl border border-[var(--border)] p-3 transition-colors",
                    style.bg,
                    snapshot.isDraggingOver && "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                  )}
                >
                  {/* Column header */}
                  <div className="mb-3 flex items-center justify-between rounded-xl px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">{col.title}</h3>
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                        {count}
                      </span>
                    </div>
                    <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                      {formatCompact(total)}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {(clientsByColumn[col.id] ?? []).map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DealCard
                              client={client}
                              onClick={() => onCardClick(client.id)}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {/* Column footer total */}
                  {count > 1 && (
                    <div className="mt-3 border-t border-[var(--border)] pt-2 text-center text-xs text-[var(--text-muted)]">
                      Total: <span className="font-medium text-[var(--foreground)]">{formatCurrency(total)}</span>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

// ---------------------------------------------------------------------------
// Funnel View (enhanced)
// ---------------------------------------------------------------------------

function FunnelView({
  clientsByColumn,
  montantsByColumn,
}: {
  clientsByColumn: Record<string, ClientWithDevis[]>;
  montantsByColumn: Record<string, number>;
}) {
  const firstCount = (clientsByColumn[COLUMNS[0].id] ?? []).length;

  return (
    <div className="glass-card space-y-5 rounded-2xl p-6">
      <h3 className="font-semibold text-[var(--foreground)]">Conversion par étape</h3>
      <div className="space-y-2">
        {COLUMNS.map((col, i) => {
          const count = (clientsByColumn[col.id] ?? []).length;
          const montant = montantsByColumn[col.id] ?? 0;
          const prevCount = i > 0 ? (clientsByColumn[COLUMNS[i - 1].id] ?? []).length : count;
          const conversion = prevCount > 0 ? (count / prevCount) * 100 : 0;
          const conversionFromStart = firstCount > 0 ? (count / firstCount) * 100 : 0;
          const dropOff = i > 0 && prevCount > 0 ? prevCount - count : 0;
          const style = COLUMN_STYLES[col.accent];

          return (
            <div key={col.id}>
              {/* Drop-off indicator between stages */}
              {i > 0 && dropOff > 0 && (
                <div className="flex items-center gap-2 py-1 pl-44">
                  <TrendingDown className="h-3 w-3 text-red-400/60" />
                  <span className="text-[11px] text-red-400/60">
                    -{dropOff} deal{dropOff > 1 ? "s" : ""} perdus
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="w-40 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", style.dot)} />
                    <p className="text-sm font-medium text-[var(--foreground)]">{col.title}</p>
                  </div>
                  <p className="mt-0.5 pl-4 text-xs text-[var(--text-muted)]">
                    {count} deal{count > 1 ? "s" : ""} · {formatCurrency(montant)}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="relative h-10 overflow-hidden rounded-xl bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(conversionFromStart, 3)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-xl",
                        col.accent === "emerald"
                          ? "bg-gradient-to-r from-emerald-600/60 to-emerald-400/40"
                          : col.accent === "red"
                            ? "bg-gradient-to-r from-red-600/40 to-red-400/20"
                            : "bg-gradient-to-r from-nova-mid/50 to-nova-mid/20"
                      )}
                    />
                    <div className="relative flex h-full items-center px-3">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {conversionFromStart.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-20 shrink-0 text-right">
                  {i > 0 ? (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        conversion >= 70 ? "text-emerald-400" : conversion >= 40 ? "text-amber-400" : "text-red-400"
                      )}
                    >
                      {conversion.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--text-muted)]">—</span>
                  )}
                  {i > 0 && (
                    <p className="text-[10px] text-[var(--text-muted)]">conversion</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

function ListView({
  clients,
  sortKey,
  onSortChange,
  onCardClick,
}: {
  clients: ClientWithDevis[];
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  onCardClick: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === clients.length) setSelected(new Set());
    else setSelected(new Set(clients.map((c) => c.id)));
  }

  const columnTitle = (colId: string) => COLUMNS.find((c) => c.id === colId)?.title ?? colId;
  const columnAccent = (colId: string) => {
    const col = COLUMNS.find((c) => c.id === colId);
    return col ? COLUMN_STYLES[col.accent].dot : "";
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--accent)]/5 px-4 py-2 text-sm">
          <span className="font-medium text-[var(--accent)]">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-muted)]">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === clients.length && clients.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
              </th>
              <th className="px-4 py-3">Client</th>
              <SortableHeader label="Montant" sortKey="amount" currentSort={sortKey} onChange={onSortChange} />
              <th className="px-4 py-3">Étape</th>
              <th className="px-4 py-3">Type</th>
              <SortableHeader label="Dernière activité" sortKey="date" currentSort={sortKey} onChange={onSortChange} />
              <SortableHeader label="Probabilité" sortKey="probability" currentSort={sortKey} onChange={onSortChange} />
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const typeKey = getTypeProjet(client.notes);
              const type = TYPE_BADGES[typeKey] ?? TYPE_BADGES.renovation;
              const jours = getJoursSansActivite(client);
              const proba = getProbabilite(client.statutPipeline);
              const montant = getMontantEstime(client);

              return (
                <tr
                  key={client.id}
                  className="border-b border-[var(--border)]/50 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(client.id)}
                      onChange={() => toggleSelect(client.id)}
                      className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onCardClick(client.id)}
                      className="text-left font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                    >
                      {client.prenom} {client.nom}
                    </button>
                    <p className="text-xs text-[var(--text-muted)]">{client.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold", montant >= 20000 ? "gradient-text" : "text-[var(--foreground)]")}>
                      {formatCurrency(montant)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", columnAccent(client.statutPipeline))} />
                      <span className="text-[var(--foreground)]">{columnTitle(client.statutPipeline)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", type.color)}>
                      {type.icon} {type.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-sm",
                        jours > 14 ? "text-red-400" : jours > 7 ? "text-orange-400" : "text-[var(--text-muted)]"
                      )}
                    >
                      {jours === 0 ? "Aujourd'hui" : `il y a ${jours}j`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            proba >= 70 && "bg-emerald-500",
                            proba >= 30 && proba < 70 && "bg-amber-500",
                            proba < 30 && proba > 0 && "bg-red-400",
                            proba === 0 && "bg-[var(--text-muted)]"
                          )}
                          style={{ width: `${proba}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{proba}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <QuickAction icon={Phone} label="Appeler" onClick={(e) => { e.stopPropagation(); if (client.telephone) window.open(`tel:${client.telephone}`); }} />
                      <QuickAction icon={Mail} label="Email" onClick={(e) => { e.stopPropagation(); if (client.email) window.open(`mailto:${client.email}`); }} />
                      <QuickAction icon={Eye} label="Voir" onClick={(e) => { e.stopPropagation(); onCardClick(client.id); }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            Aucun deal ne correspond à vos filtres.
          </div>
        )}
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onChange,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  onChange: (key: SortKey) => void;
}) {
  const active = currentSort === sortKey;
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onChange(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          active ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
        )}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}
