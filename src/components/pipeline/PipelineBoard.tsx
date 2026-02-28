"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
  { id: "PROSPECT", title: "Prospect" },
  { id: "CONTACTE", title: "Contacté" },
  { id: "DEVIS_ENVOYE", title: "Devis envoyé" },
  { id: "NEGOCIATION", title: "Négociation" },
  { id: "SIGNE", title: "Signé" },
  { id: "EN_COURS", title: "En cours" },
  { id: "TERMINE", title: "Terminé" },
  { id: "PERDU", title: "Perdu" },
];

type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statutPipeline: string;
};

export function PipelineBoard() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
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
    }
  }

  const clientsByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = clients.filter((c) => c.statutPipeline === col.id);
      return acc;
    },
    {} as Record<string, Client[]>
  );

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-72 shrink-0">
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-72 shrink-0"
              >
                <Card>
                  <CardHeader className="py-3">
                    <h3 className="font-semibold">
                      {col.title}{" "}
                      <span className="text-[var(--text-muted)]">
                        ({clientsByColumn[col.id]?.length ?? 0})
                      </span>
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {(clientsByColumn[col.id] ?? []).map((client, index) => (
                      <Draggable
                        key={client.id}
                        draggableId={client.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => router.push(`/clients/${client.id}`)}
                            className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <p className="font-medium">
                              {client.prenom} {client.nom}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{client.email}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
