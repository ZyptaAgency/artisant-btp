"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STYLES = [
  {
    id: "MODERNE",
    label: "Moderne",
    desc: "Design épuré, couleurs vives",
    preview: {
      accentColor: "#2563EB",
      headerBg: "#f0f7ff",
      lines: true,
    },
  },
  {
    id: "CLASSIQUE",
    label: "Classique",
    desc: "Style traditionnel, sobre",
    preview: {
      accentColor: "#374151",
      headerBg: "#f3f4f6",
      lines: true,
    },
  },
  {
    id: "EPURE",
    label: "Épuré",
    desc: "Minimaliste, noir et blanc",
    preview: {
      accentColor: "#000000",
      headerBg: "#ffffff",
      lines: false,
    },
  },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

function DocumentPreview({ style }: { style: (typeof STYLES)[number] }) {
  const { accentColor, headerBg, lines } = style.preview;
  return (
    <div className="mt-3 w-full rounded-lg border border-[var(--border)] bg-white p-3 text-[10px]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="h-2 w-12 rounded-sm" style={{ background: accentColor }} />
          <div className="mt-1 h-1 w-20 rounded-sm bg-gray-300" />
        </div>
        <div className="text-right">
          <div className="h-1.5 w-10 rounded-sm bg-gray-200" />
          <div className="mt-0.5 h-1 w-14 rounded-sm bg-gray-200" />
        </div>
      </div>
      <div className="mb-2 rounded-sm p-1.5" style={{ background: headerBg }}>
        <div className="flex gap-4">
          <div className="h-1 w-16 rounded-sm bg-gray-300" />
          <div className="h-1 w-8 rounded-sm bg-gray-300" />
          <div className="h-1 w-10 rounded-sm bg-gray-300" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn("flex gap-4 py-1", lines && "border-b border-gray-100")}
        >
          <div className="h-1 w-20 rounded-sm bg-gray-200" />
          <div className="h-1 w-6 rounded-sm bg-gray-200" />
          <div className="h-1 w-10 rounded-sm bg-gray-200" />
        </div>
      ))}
      <div className="mt-2 flex justify-end">
        <div className="rounded-sm px-2 py-1" style={{ background: accentColor + "15" }}>
          <div className="h-1.5 w-14 rounded-sm" style={{ background: accentColor }} />
        </div>
      </div>
    </div>
  );
}

export function DocumentModelForm({ current }: { current: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<StyleId>((current as StyleId) || "MODERNE");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentStyle: selected }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Style enregistré");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transition-opacity duration-300">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Modèles de documents</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Choisissez le style de vos devis et factures.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={cn(
              "flex flex-col rounded-xl border-2 p-4 text-left transition-all",
              selected === s.id
                ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_20px_var(--ring)]"
                : "border-[var(--border)] hover:border-[var(--accent)]/30"
            )}
          >
            <span className="font-medium text-[var(--foreground)]">{s.label}</span>
            <span className="mt-1 text-xs text-[var(--text-muted)]">{s.desc}</span>
            <DocumentPreview style={s} />
          </button>
        ))}
      </div>
      <Button className="mt-6" onClick={handleSave} disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}
