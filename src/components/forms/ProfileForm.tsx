"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ACTIVITES_BTP = [
  "Plomberie",
  "Électricité",
  "Maçonnerie",
  "Peinture",
  "Carrelage",
  "Menuiserie",
  "Couverture / Toiture",
  "Chauffage / Climatisation",
  "Terrassement",
  "Rénovation générale",
  "Multi-corps d'état",
  "Autre",
] as const;

const schema = z.object({
  nom: z.string().min(1),
  entreprise: z.string().min(1),
  activite: z.string().optional(),
  siret: z.string().optional(),
  identifiantType: z.enum(["SIRET", "BCE"]).optional(),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  villeMeteo: z.string().optional(),
  logo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const MAX_LOGO_SIZE = 500 * 1024; // 500 KB

export function ProfileForm({ defaultValues }: { defaultValues: FormData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const logoValue = watch("logo");
  const identifiantType = watch("identifiantType") ?? "SIRET";

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format accepté : PNG, JPG, WebP");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Logo max 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setValue("logo", result);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Profil mis à jour");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input {...register("nom")} />
        {errors.nom && <p className="text-sm text-red-600">{errors.nom.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Entreprise</Label>
        <Input {...register("entreprise")} />
        {errors.entreprise && <p className="text-sm text-red-600">{errors.entreprise.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Activité / Métier</Label>
        <select
          {...register("activite")}
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">— Sélectionner —</option>
          {ACTIVITES_BTP.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Identifiant</Label>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="SIRET" {...register("identifiantType")} className="rounded" />
              <span className="text-sm">SIRET (France)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="BCE" {...register("identifiantType")} className="rounded" />
              <span className="text-sm">BCE (Belgique)</span>
            </label>
          </div>
          <Input {...register("siret")} placeholder={identifiantType === "BCE" ? "Numéro BCE" : "SIRET"} className="flex-1 max-w-[200px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input {...register("telephone")} />
      </div>
      <div className="space-y-2">
        <Label>Adresse</Label>
        <Input {...register("adresse")} />
      </div>
      <div className="space-y-2">
        <Label>Ville (météo)</Label>
        <Input {...register("villeMeteo")} placeholder="Paris" />
        <p className="text-xs text-[var(--text-muted)]">Ville affichée pour la météo sur le tableau de bord.</p>
      </div>
      <div className="space-y-2">
        <Label>Logo entreprise (PDF)</Label>
        <p className="text-xs text-[var(--text-muted)]">Affiché sur les devis et factures. Max 500 Ko, PNG/JPG/WebP.</p>
        <div className="flex gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoFile}
            className="hidden"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            {logoValue ? "Changer le logo" : "Téléverser un logo"}
          </Button>
          {logoValue && (
            <div className="flex items-center gap-2">
              <img src={logoValue} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain border rounded" />
              <button type="button" onClick={() => setValue("logo", "")} className="text-sm text-red-600 hover:underline">
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
