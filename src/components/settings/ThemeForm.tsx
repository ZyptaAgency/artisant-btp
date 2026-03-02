"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { toast } from "sonner";

const THEMES = [
  { id: "supernova", labelKey: "theme.supernova", descKey: "theme.supernovaDesc", icon: Sparkles },
  { id: "noir", labelKey: "theme.noir", descKey: "theme.noirDesc", icon: Moon },
  { id: "blanc", labelKey: "theme.blanc", descKey: "theme.blancDesc", icon: Sun },
  { id: "systeme", labelKey: "theme.systeme", descKey: "theme.systemeDesc", icon: Monitor },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemeForm({ current }: { current: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ThemeId>((current as ThemeId) || "supernova");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selected }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(t("theme.themeSaved"));
      router.refresh();
      window.dispatchEvent(new Event("theme-changed"));
    } catch {
      toast.error(t("errors.saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transition-opacity duration-300">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{t("theme.title")}</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        {t("theme.desc")}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {THEMES.map((tmpl) => {
          const Icon = tmpl.icon;
          return (
            <button
            key={tmpl.id}
            type="button"
            onClick={() => setSelected(tmpl.id)}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all sm:min-w-[160px] ${
              selected === tmpl.id
                  ? "border-nova-mid bg-nova-mid/5"
                  : "border-[var(--border)] hover:border-[var(--border)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
              <div>
                <span className="font-medium text-[var(--foreground)]">{t(tmpl.labelKey as import("@/lib/i18n").TranslationKey)}</span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{t(tmpl.descKey as import("@/lib/i18n").TranslationKey)}</span>
              </div>
            </button>
          );
        })}
      </div>
      <Button className="mt-4" onClick={handleSave} disabled={loading}>
        {loading ? t("clients.modifying") : t("common.save")}
      </Button>
    </div>
  );
}
