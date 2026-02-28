"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  nom: z.string().min(1),
  entreprise: z.string().min(1),
  siret: z.string().optional(),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProfileForm({ defaultValues }: { defaultValues: FormData }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Profil mis à jour");
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
        <Label>SIRET</Label>
        <Input {...register("siret")} />
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
