"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Sparkles } from "lucide-react";
import { toast } from "sonner";

const THEMES = [
  { id: "supernova", label: "Supernova", icon: Sparkles, desc: "Violet, rose et bleu (défaut)" },
  { id: "noir", label: "Noir", icon: Moon, desc: "Mode sombre, accents dorés" },
  { id: "blanc", label: "Blanc", icon: Sun, desc: "Mode clair, accents dorés" },
  { id: "systeme", label: "Système", icon: Monitor, desc: "Suivre jour/nuit" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemeForm({ current }: { current: string }) {
  const router = useRouter();
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
      toast.success("Thème enregistré");
      router.refresh();
      window.dispatchEvent(new Event("theme-changed"));
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transition-opacity duration-300">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Apparence</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Choisissez le thème de l&apos;interface.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {THEMES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all sm:min-w-[160px] ${
                selected === t.id
                  ? "border-nova-mid bg-nova-mid/5"
                  : "border-[var(--border)] hover:border-[var(--border)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
              <div>
                <span className="font-medium text-[var(--foreground)]">{t.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{t.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
      <Button className="mt-4" onClick={handleSave} disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}
