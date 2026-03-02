"use client";

import { useState } from "react";
import {
  Building2,
  User,
  FileText,
  Library,
  Layout,
  Hash,
  Palette,
  Globe,
} from "lucide-react";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { DocumentModelForm } from "@/components/settings/DocumentModelForm";
import { ThemeForm } from "@/components/settings/ThemeForm";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Locale, localeNames } from "@/lib/i18n";
import { toast } from "sonner";

const SECTIONS = [
  { id: "entreprise", labelKey: "settings.sectionCompany", icon: Building2 },
  { id: "profil", labelKey: "settings.sectionProfile", icon: User },
  { id: "apparence", labelKey: "settings.sectionAppearance", icon: Palette },
  { id: "mentions", labelKey: "settings.sectionLegal", icon: FileText },
  { id: "prestations", labelKey: "settings.sectionPrestations", icon: Library },
  { id: "modeles", labelKey: "settings.sectionModels", icon: Layout },
  { id: "numerotation", labelKey: "settings.sectionNumerotation", icon: Hash },
  { id: "langue", labelKey: "settings.sectionLanguage", icon: Globe },
] as const;

type UserData = {
  nom: string;
  entreprise: string;
  activite: string | null;
  siret: string | null;
  identifiantType: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  tauxTVA: number | null;
  villeMeteo: string | null;
  logo: string | null;
  documentStyle: string;
  theme: string;
};

function LanguageForm() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="transition-opacity duration-300">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">
        {t("settings.language")}
      </h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        {t("settings.chooseLanguage")}
      </p>
      <div className="flex gap-3">
        {(Object.entries(localeNames) as [Locale, string][]).map(
          ([code, name]) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                toast.success(code === "fr" ? "Langue changée en français" : "Language changed to English");
              }}
              className={cn(
                "rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-300",
                locale === code
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_20px_var(--ring)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-white)] hover:bg-white/5"
              )}
            >
              {name}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function ParametresZypta({ user }: { user: UserData }) {
  const { t } = useLanguage();
  const [active, setActive] = useState("entreprise");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="w-full shrink-0 lg:w-56">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                  active === s.id
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_20px_var(--ring)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-white)] hover:bg-white/5"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {t(s.labelKey as import("@/lib/i18n").TranslationKey)}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <div className="glass-card p-6">
          {active === "entreprise" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">{t("settings.sectionCompany")}</h2>
              <p className="mb-6 text-sm text-[var(--text-muted)]">
                {t("settings.companyInfo")}
              </p>
              <ProfileForm
                defaultValues={{
                  nom: user.nom,
                  entreprise: user.entreprise,
                  activite: user.activite ?? "",
                  siret: user.siret ?? "",
                  identifiantType: user.identifiantType === "BCE" ? "BCE" : user.identifiantType === "IDE" ? "IDE" : "SIRET",
                  email: user.email,
                  telephone: user.telephone ?? "",
                  adresse: user.adresse ?? "",
                  tauxTVA: user.tauxTVA ?? 20,
                  villeMeteo: user.villeMeteo ?? "Paris",
                  logo: user.logo ?? "",
                }}
              />
            </div>
          )}

          {active === "profil" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">{t("settings.sectionProfile")}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {t("settings.profileManagement")}
              </p>
              <ProfileSection email={user.email} />
            </div>
          )}

          {active === "mentions" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">{t("settings.sectionLegal")}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {t("settings.legalCustomize")}
              </p>
            </div>
          )}

          {active === "prestations" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">{t("settings.sectionPrestations")}</h2>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                {t("settings.prestationsManage")}
              </p>
              <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
                {t("settings.prestationsComingSoon")}
              </p>
            </div>
          )}

          {active === "apparence" && (
            <ThemeForm current={user.theme} />
          )}

          {active === "modeles" && (
            <DocumentModelForm current={user.documentStyle} />
          )}

          {active === "numerotation" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-white)]">{t("settings.sectionNumerotation")}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {t("settings.numerotationDesc")}
              </p>
            </div>
          )}

          {active === "langue" && <LanguageForm />}

        </div>
      </div>
    </div>
  );
}
