"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, BarChart3, LayoutGrid } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: "PROSPECT", title: "Premier contact", color: "bg-white/5" },
  { id: "CONTACTE", title: "Visite programmée", color: "bg-blue-50" },
  { id: "DEVIS_ENVOYE", title: "Devis envoyé", color: "bg-cyan-50" },
  { id: "NEGOCIATION", title: "Négociation", color: "bg-amber-50" },
  { id: "SIGNE", title: "Signé ✅", color: "bg-emerald-50" },
  { id: "PERDU", title: "Perdu ❌", color: "bg-red-50" },
];

const PROJET_ICONS: Record<string, { icon: string; label: string }> = {
  renovation: { icon: "🏠", label: "Rénovation" },
  depannage: { icon: "🔧", label: "Dépannage" },
  construction: { icon: "🏗️", label: "Construction" },
};

function getTypeProjet(notes: string | null): { icon: string; label: string } {
  if (!notes) return PROJET_ICONS.renovation;
  const n = notes.toLowerCase();
  if (n.includes("dépannage") || n.includes("depannage")) return PROJET_ICONS.depannage;
  if (n.includes("construction") || n.includes("extension")) return PROJET_ICONS.construction;
  return PROJET_ICONS.renovation;
}

type ClientWithDevis = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statutPipeline: string;
  notes: string | null;
  updatedAt: string;
  devis?: { montantTTC: number; updatedAt: string }[];
};

function getMontantEstime(client: ClientWithDevis): number {
  const devis = client.devis ?? [];
  if (devis.length === 0) return 0;
  return Math.max(...devis.map((d) => d.montantTTC));
}

function getDernierContact(client: ClientWithDevis): Date | null {
  const devis = client.devis ?? [];
  if (devis.length === 0) return new Date(client.updatedAt);
  return new Date(Math.max(...devis.map((d) => new Date(d.updatedAt).getTime())));
}

function getJoursSansActivite(client: ClientWithDevis): number {
  const last = getDernierContact(client);
  if (!last) return 999;
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function getProbabilite(client: ClientWithDevis): number {
  const statuts: Record<string, number> = {
    PROSPECT: 10,
    CONTACTE: 25,
    DEVIS_ENVOYE: 50,
    NEGOCIATION: 65,
    SIGNE: 100,
    PERDU: 0,
  };
  return statuts[client.statutPipeline] ?? 30;
}

export function PipelineZypta() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithDevis[]>([]);
  const [loading, setLoading] = useState(true);
  const [vueFunnel, setVueFunnel] = useState(false);
  const [factureModal, setFactureModal] = useState<{ clientId: string; nom: string } | null>(null);

  useEffect(() => {
    fetch("/api/clients?extended=1")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.filter((c: ClientWithDevis) => COLUMNS.some((col) => col.id === c.statutPipeline)));
        setLoading(false);
      });
  }, []);

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

  const clientsByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = clients.filter((c) => c.statutPipeline === col.id);
      return acc;
    },
    {} as Record<string, ClientWithDevis[]>
  );

  const montantsByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = (clientsByColumn[col.id] ?? []).reduce(
        (s, c) => s + getMontantEstime(c),
        0
      );
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="h-96 w-72 shrink-0 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pipeline</h1>
          <p className="text-[var(--text-muted)]">Votre business en un coup d&apos;œil</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vueFunnel ? "outline" : "default"}
            size="sm"
            onClick={() => setVueFunnel(false)}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={vueFunnel ? "default" : "outline"}
            size="sm"
            onClick={() => setVueFunnel(true)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Funnel
          </Button>
        </div>
      </div>

      {vueFunnel ? (
        <FunnelView clientsByColumn={clientsByColumn} montantsByColumn={montantsByColumn} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn("w-80 shrink-0 rounded-2xl border border-[var(--border)] p-4", col.color)}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-[var(--foreground)]">{col.title}</h3>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-sm font-medium text-[var(--text-muted)]">
                        {formatCurrency(montantsByColumn[col.id] ?? 0)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(clientsByColumn[col.id] ?? []).map((client, index) => {
                        const stagnant = getJoursSansActivite(client) >= 7;
                        const proba = getProbabilite(client);
                        const typeProjet = getTypeProjet(client.notes);
                        return (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => router.push(`/clients/${client.id}`)}
                                className={cn(
                                  "cursor-grab rounded-xl border bg-[var(--bg-card)] p-3 shadow-sm transition-all duration-300 active:cursor-grabbing hover:shadow-md",
                                  stagnant && "animate-pulse border-orange-400 ring-2 ring-orange-200"
                                )}
                              >
                                {stagnant && (
                                  <div className="mb-2 flex items-center gap-1 text-xs font-medium text-orange-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    À relancer
                                  </div>
                                )}
                                <p className="font-semibold text-[var(--foreground)]">
                                  {client.prenom} {client.nom}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                  <span>{typeProjet.icon}</span>
                                  <span>{typeProjet.label}</span>
                                </div>
                                <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
                                  {formatCurrency(getMontantEstime(client))}
                                </p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                  {formatDate(getDernierContact(client)?.toISOString() ?? client.updatedAt)}
                                </p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      proba >= 70 && "bg-emerald-500",
                                      proba >= 30 && proba < 70 && "bg-amber-500",
                                      proba < 30 && proba > 0 && "bg-red-400",
                                      proba === 0 && "bg-[var(--text-white)]"
                                    )}
                                    style={{ width: `${proba}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {factureModal && (
        <Dialog open={!!factureModal} onOpenChange={(open) => !open && setFactureModal(null)}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Créer la facture</DialogTitle>
            </DialogHeader>
            <p className="text-[var(--text-muted)]">
              Le deal avec <strong>{factureModal.nom}</strong> est signé. Souhaitez-vous créer la facture
              correspondante ?
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

function FunnelView({
  clientsByColumn,
  montantsByColumn,
}: {
  clientsByColumn: Record<string, ClientWithDevis[]>;
  montantsByColumn: Record<string, number>;
}) {
  const total = Object.values(montantsByColumn).reduce((a, b) => a + b, 0);
  let cumul = 0;

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <h3 className="font-semibold text-[var(--foreground)]">Conversion par étape</h3>
      <div className="space-y-3">
        {COLUMNS.map((col, i) => {
          const count = (clientsByColumn[col.id] ?? []).length;
          const montant = montantsByColumn[col.id] ?? 0;
          cumul += montant;
          const pct = total > 0 ? (cumul / total) * 100 : 0;
          const prevCount = i > 0 ? (clientsByColumn[COLUMNS[i - 1].id] ?? []).length : count;
          const conversion = prevCount > 0 ? ((count / prevCount) * 100).toFixed(0) : "—";

          return (
            <div key={col.id} className="flex items-center gap-4">
              <div className="w-40 shrink-0">
                <p className="font-medium text-[var(--foreground)]">{col.title}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {count} deal{count > 1 ? "s" : ""} • {formatCurrency(montant)}
                </p>
              </div>
              <div className="flex-1">
                <div className="h-8 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-nova-mid to-zypta-orange transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-16 shrink-0 text-right text-sm font-medium text-[var(--text-muted)]">
                {i > 0 ? `${conversion}%` : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
