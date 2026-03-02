"use client";

import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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

const TVA_OPTIONS = [
  { label: "0% (Exonéré)", value: 0 },
  { label: "5.5% (France)", value: 5.5 },
  { label: "10% (France)", value: 10 },
  { label: "20% (France)", value: 20 },
  { label: "6% (Belgique)", value: 6 },
  { label: "12% (Belgique)", value: 12 },
  { label: "21% (Belgique)", value: 21 },
  { label: "2.5% (Suisse)", value: 2.5 },
  { label: "3.7% (Suisse)", value: 3.7 },
  { label: "7.7% (Suisse)", value: 7.7 },
] as const;

const schema = z.object({
  nom: z.string().min(1),
  entreprise: z.string().min(1),
  activite: z.string().optional(),
  siret: z.string().optional(),
  identifiantType: z.enum(["SIRET", "BCE", "IDE"]).optional(),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  tauxTVA: z.number().optional(),
  villeMeteo: z.string().optional(),
  objectifMensuel: z.number().optional(),
  logo: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.siret) return;
  const digits = data.siret.replace(/\D/g, "");
  const type = data.identifiantType ?? "SIRET";
  if (type === "SIRET" && digits.length !== 14) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le SIRET doit contenir exactement 14 chiffres", path: ["siret"] });
  } else if (type === "BCE" && digits.length !== 10) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le BCE doit contenir exactement 10 chiffres", path: ["siret"] });
  } else if (type === "IDE" && digits.length !== 9) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "L\u0027IDE doit contenir exactement 9 chiffres (CHE-XXX.XXX.XXX)", path: ["siret"] });
  }
});

type FormData = z.infer<typeof schema>;

const MAX_LOGO_SIZE = 500 * 1024; // 500 KB

export function ProfileForm({ defaultValues }: { defaultValues: FormData }) {
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const logoValue = watch("logo");
  const identifiantType = watch("identifiantType") ?? "SIRET";
  const activiteValue = watch("activite") ?? "";

  const isCustomActivite = activiteValue === "__custom__" || (activiteValue !== "" && !ACTIVITES_BTP.includes(activiteValue as typeof ACTIVITES_BTP[number]));
  const [customActivite, setCustomActivite] = useState(isCustomActivite ? activiteValue : "");

  useEffect(() => {
    if (isCustomActivite && activiteValue !== "__custom__") {
      setCustomActivite(activiteValue);
    }
  }, [activiteValue, isCustomActivite]);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("PNG, JPG, WebP");
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
      toast.success(t("profile.profileUpdated"));
      router.refresh();
    } catch {
      toast.error(t("errors.saveError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>{t("profile.nom")}</Label>
        <Input {...register("nom")} />
        {errors.nom && <p className="text-sm text-red-600">{errors.nom.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t("profile.entreprise")}</Label>
        <Input {...register("entreprise")} />
        {errors.entreprise && <p className="text-sm text-red-600">{errors.entreprise.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t("profile.activite")}</Label>
        <select
          value={isCustomActivite ? "__custom__" : activiteValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__custom__") {
              setValue("activite", customActivite || "__custom__");
            } else {
              setValue("activite", val);
              setCustomActivite("");
            }
          }}
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] [&>option]:bg-[var(--bg-card)] [&>option]:text-[var(--foreground)]"
        >
          <option value="">{t("profile.selectActivity")}</option>
          {ACTIVITES_BTP.filter((a) => a !== "Autre").map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
          <option value="__custom__">{t("profile.otherActivity")}</option>
        </select>
        {isCustomActivite && (
          <Input
            placeholder={t("profile.specifyActivity")}
            value={customActivite}
            onChange={(e) => {
              setCustomActivite(e.target.value);
              setValue("activite", e.target.value);
            }}
          />
        )}
      </div>
      <div className="space-y-2">
        <Label>Identifiant</Label>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="SIRET" {...register("identifiantType")} className="rounded" />
              <span className="text-sm">{t("profile.siretFrance")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="BCE" {...register("identifiantType")} className="rounded" />
              <span className="text-sm">{t("profile.bceBelgium")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="IDE" {...register("identifiantType")} className="rounded" />
              <span className="text-sm">{t("profile.ideSwitzerland")}</span>
            </label>
          </div>
          <Input
            {...register("siret")}
            placeholder={
              identifiantType === "BCE"
                ? "0XXX.XXX.XXX (10 chiffres)"
                : identifiantType === "IDE"
                ? "CHE-XXX.XXX.XXX (9 chiffres)"
                : "14 chiffres"
            }
            className="max-w-[280px]"
          />
          {errors.siret && <p className="text-sm text-red-600">{errors.siret.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("profile.email")}</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t("profile.phone")}</Label>
        <Input {...register("telephone")} />
      </div>
      <div className="space-y-2">
        <Label>{t("profile.address")}</Label>
        <Input {...register("adresse")} />
      </div>
      <div className="space-y-2">
        <Label>{t("profile.defaultTva")}</Label>
        <select
          {...register("tauxTVA", { valueAsNumber: true })}
          className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {TVA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-muted)]">{t("profile.tvaDefault")}</p>
      </div>
      <div className="space-y-2">
        <Label>{t("profile.revenueGoal")}</Label>
        <Input
          type="number"
          step="100"
          min="0"
          {...register("objectifMensuel", { valueAsNumber: true })}
          placeholder="10000"
        />
        <p className="text-xs text-[var(--text-muted)]">{t("profile.revenueGoalDesc")}</p>
      </div>
      <div className="space-y-2">
        <Label>{t("profile.weatherCity")}</Label>
        <Input {...register("villeMeteo")} placeholder="Paris" />
        <p className="text-xs text-[var(--text-muted)]">{t("profile.weatherCityDesc")}</p>
      </div>
      <div className="space-y-2">
        <Label>Logo</Label>
        <p className="text-xs text-[var(--text-muted)]">{t("profile.logoDesc")}</p>
        <div className="flex gap-3 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoFile}
            className="hidden"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            {logoValue ? t("profile.changeLogo") : t("profile.uploadLogo")}
          </Button>
          {logoValue && (
            <div className="flex items-center gap-2">
              <img src={logoValue} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain border rounded" />
              <button type="button" onClick={() => setValue("logo", "")} className="text-sm text-red-600 hover:underline">
                {t("common.delete")}
              </button>
            </div>
          )}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("clients.modifying") : t("common.save")}
      </Button>
    </form>
  );
}
