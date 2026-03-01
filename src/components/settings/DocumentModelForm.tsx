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
  const { accentColor } = style.preview;
  const isModerne = style.id === "MODERNE";
  const isClassique = style.id === "CLASSIQUE";
  const isEpure = style.id === "EPURE";

  return (
    <div className="mt-3 w-full rounded-lg border border-[var(--border)] bg-white overflow-hidden text-[9px] leading-tight">
      {/* Header area */}
      <div
        className={cn(
          "p-2",
          isModerne && "rounded-t-lg flex items-start justify-between",
          isClassique && "border-2 border-gray-400 bg-gray-100 text-center",
          isEpure && "pb-4 flex items-start justify-between"
        )}
        style={isModerne ? { background: accentColor } : undefined}
      >
        {isClassique ? (
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 shrink-0 rounded border border-gray-500" />
            <span className="font-medium text-gray-800">Artisan BTP</span>
            <span className="text-gray-600">Devis N°001</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-4 w-4 shrink-0 rounded",
                  isModerne && "bg-white/30",
                  isEpure && "border border-black"
                )}
              />
              <span
                className={cn(
                  "font-medium truncate max-w-[60px]",
                  isModerne && "text-white",
                  isEpure && "text-black"
                )}
              >
                Artisan BTP
              </span>
            </div>
            <div className={cn("text-right", isModerne && "text-white/90", isEpure && "text-black")}>
              Devis N°001
            </div>
          </>
        )}
      </div>

      {/* Table section */}
      <div className={cn("p-2", isEpure && "pt-4")}>
        {/* Table header */}
        <div
          className={cn(
            "flex gap-2 py-1 px-1 font-medium",
            isModerne && "rounded-t text-white",
            isClassique && "border-x border-t border-gray-400 bg-gray-200",
            isEpure && "text-black"
          )}
          style={isModerne ? { background: accentColor } : undefined}
        >
          <span className="flex-1 min-w-0 truncate">Désignation</span>
          <span className="w-8 shrink-0">Qté</span>
          <span className="w-10 shrink-0">Total</span>
        </div>

        {/* Table rows */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 py-1 px-1 text-gray-600",
              isModerne && "border-b border-gray-100",
              isClassique && "border-x border-b border-gray-400",
              isEpure && "py-2"
            )}
          >
            <span className="flex-1 min-w-0 truncate">Prestation {i}</span>
            <span className="w-8 shrink-0">1</span>
            <span className="w-10 shrink-0">150 €</span>
          </div>
        ))}

        {/* Totals section */}
        <div
          className={cn(
            "mt-2 flex justify-end py-1.5 px-2 font-medium",
            isModerne && "rounded-lg",
            isClassique && "border-2 border-gray-400 mt-2",
            isEpure && "border-t border-black mt-4"
          )}
          style={isModerne ? { background: accentColor + "20", color: accentColor } : isEpure ? { color: "#000" } : undefined}
        >
          <span className={isClassique ? "text-gray-800" : ""}>Total: 450 €</span>
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
