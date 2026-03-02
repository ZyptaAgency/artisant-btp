"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
        toast.error(result.error ?? t("errors.generic"));
        return;
      }

      toast.success(client ? t("clients.clientUpdated") : t("clients.clientCreated"));
      onSuccess();
    } catch {
      toast.error(t("errors.saveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? t("clients.editClient") : t("clients.newClient")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">{t("clients.firstName")}</Label>
              <Input id="prenom" {...register("prenom")} />
              {errors.prenom && (
                <p className="text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">{t("clients.lastName")}</Label>
              <Input id="nom" {...register("nom")} />
              {errors.nom && (
                <p className="text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telephone">{t("clients.phone")}</Label>
            <Input id="telephone" {...register("telephone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresseChantier">{t("clients.interventionAddress")}</Label>
            <Input id="adresseChantier" {...register("adresseChantier")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statutPipeline">{t("clients.pipelineStatus")}</Label>
            <Select id="statutPipeline" {...register("statutPipeline")}>
              <option value="PROSPECT">{t("clients.statusProspect")}</option>
              <option value="CONTACTE">{t("clients.statusContacte")}</option>
              <option value="DEVIS_ENVOYE">{t("clients.statusDevisEnvoye")}</option>
              <option value="NEGOCIATION">{t("clients.statusNegociation")}</option>
              <option value="SIGNE">{t("clients.statusSigne")}</option>
              <option value="EN_COURS">{t("clients.statusEnCours")}</option>
              <option value="TERMINE">{t("clients.statusTermine")}</option>
              <option value="PERDU">{t("clients.statusPerdu")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("clients.notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("clients.modifying") : client ? t("common.update") : t("clients.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
