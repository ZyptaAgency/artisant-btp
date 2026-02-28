"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StatutPipeline } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  adresseChantier: z.string().optional(),
  notes: z.string().optional(),
  statutPipeline: z.nativeEnum(StatutPipeline),
});

type FormData = z.infer<typeof schema>;

type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  adresseChantier?: string | null;
  notes?: string | null;
  statutPipeline: string;
};

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      statutPipeline: "PROSPECT",
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone ?? "",
        adresseChantier: client.adresseChantier ?? "",
        notes: client.notes ?? "",
        statutPipeline: client.statutPipeline as StatutPipeline,
      });
    } else {
      reset({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresseChantier: "",
        notes: "",
        statutPipeline: "PROSPECT",
      });
    }
  }, [client, open, reset]);

  async function onSubmit(data: FormData) {
    try {
      const url = client ? `/api/clients/${client.id}` : "/api/clients";
      const method = client ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Erreur");
        return;
      }

      toast.success(client ? "Client modifié" : "Client créé");
      onSuccess();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Modifier le client" : "Nouveau client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" {...register("prenom")} />
              {errors.prenom && (
                <p className="text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" {...register("nom")} />
              {errors.nom && (
                <p className="text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" {...register("telephone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresseChantier">Adresse chantier</Label>
            <Input id="adresseChantier" {...register("adresseChantier")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statutPipeline">Statut pipeline</Label>
            <Select id="statutPipeline" {...register("statutPipeline")}>
              <option value="PROSPECT">Prospect</option>
              <option value="CONTACTE">Contacté</option>
              <option value="DEVIS_ENVOYE">Devis envoyé</option>
              <option value="NEGOCIATION">Négociation</option>
              <option value="SIGNE">Signé</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="PERDU">Perdu</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : client ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
