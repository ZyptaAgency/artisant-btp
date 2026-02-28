"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UniteMesure } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const uniteLabels: Record<UniteMesure, string> = {
  M2: "m²",
  ML: "ml",
  FORFAIT: "Forfait",
  HEURE: "Heure",
  UNITE: "Unité",
};

const ligneSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantite: z.union([z.number(), z.string()]).transform((v) => {
    const n = Number(v);
    return isNaN(n) || n <= 0 ? 1 : n;
  }),
  unite: z.nativeEnum(UniteMesure),
  prixUnitaire: z.union([z.number(), z.string()]).transform((v) => {
    const n = Number(v);
    return isNaN(n) || n < 0 ? 0 : n;
  }),
  tauxTVA: z.union([z.number(), z.string()]).transform((v) => {
    const n = Number(v);
    return n === 10 || n === 20 ? n : 20;
  }),
});

const schema = z.object({
  clientId: z.string().min(1, "Client requis"),
  dateValidite: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema).min(1, "Au moins une ligne"),
});

type FormData = z.infer<typeof schema>;

type Client = { id: string; nom: string; prenom: string };

export function DevisForm({
  clientId,
  onSuccess,
  initialData,
}: {
  clientId?: string;
  onSuccess: (devis: { id: string }) => void;
  initialData?: Partial<FormData> & { lignes?: Array<{ description: string; quantite: number; unite: UniteMesure; prixUnitaire: number; tauxTVA: number }> };
}) {
  const [clients, setClients] = useState<Client[]>([]);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      clientId: clientId ?? "",
      lignes: initialData?.lignes ?? [
        { description: "", quantite: 1, unite: "M2", prixUnitaire: 0, tauxTVA: 20 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lignes" });

  const lignes = watch("lignes");

  const totalHT = lignes?.reduce(
    (s, l) => s + (l.quantite || 0) * (l.prixUnitaire || 0),
    0
  ) ?? 0;
  const totalTVA = lignes?.reduce(
    (s, l) => {
      const ht = (l.quantite || 0) * (l.prixUnitaire || 0);
      return s + ht * ((l.tauxTVA || 20) / 100);
    },
    0
  ) ?? 0;
  const totalTTC = totalHT + totalTVA;

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients);
  }, []);

  useEffect(() => {
    if (clientId) setValue("clientId", clientId);
  }, [clientId, setValue]);

  async function onSubmit(data: FormData) {
    const lignesValides = data.lignes
      .map((l) => ({
        ...l,
        quantite: Math.max(0.01, Number(l.quantite) || 1),
        prixUnitaire: Math.max(0, Number(l.prixUnitaire) || 0),
        tauxTVA: [10, 20].includes(Number(l.tauxTVA)) ? Number(l.tauxTVA) : 20,
      }))
      .filter((l) => l.description?.trim());

    if (lignesValides.length === 0) {
      toast.error("Ajoutez au moins une ligne avec une description");
      return;
    }

    const payload = { ...data, lignes: lignesValides };

    try {
      const url = initialData ? `/api/devis/${(initialData as { id?: string }).id}` : "/api/devis";
      const method = initialData ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      onSuccess(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Client</Label>
          <Select {...register("clientId")} disabled={!!clientId}>
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.prenom} {c.nom}
              </option>
            ))}
          </Select>
          {errors.clientId && (
            <p className="text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Date de validité</Label>
          <Input type="date" {...register("dateValidite")} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Lignes de prestation</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantite: 1, unite: "M2", prixUnitaire: 0, tauxTVA: 20 })}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="flex flex-wrap gap-2 rounded-lg border p-4">
              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Description" {...register(`lignes.${i}.description`)} />
              </div>
              <div className="w-24">
                <Input type="number" step="0.01" placeholder="Qté" {...register(`lignes.${i}.quantite`, { valueAsNumber: true })} />
              </div>
              <div className="w-28">
                <Select {...register(`lignes.${i}.unite`)}>
                  {Object.entries(uniteLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
              <div className="w-28">
                <Input type="number" step="0.01" placeholder="Prix unit." {...register(`lignes.${i}.prixUnitaire`, { valueAsNumber: true })} />
              </div>
              <div className="w-20">
                <Select {...register(`lignes.${i}.tauxTVA`, { valueAsNumber: true })}>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                </Select>
              </div>
              <div className="w-24">
                <span className="text-sm font-medium">
                  {formatCurrency((lignes?.[i]?.quantite ?? 0) * (lignes?.[i]?.prixUnitaire ?? 0))}
                </span>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} disabled={fields.length <= 1}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white/5 p-4">
        <div className="flex justify-between text-sm">
          <span>Total HT</span>
          <span>{formatCurrency(totalHT)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>TVA</span>
          <span>{formatCurrency(totalTVA)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total TTC</span>
          <span>{formatCurrency(totalTTC)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input {...register("notes")} />
      </div>

      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
