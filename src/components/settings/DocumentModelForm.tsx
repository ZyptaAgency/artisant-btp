"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STYLES = [
  { id: "MODERNE", label: "Moderne", desc: "Design épuré, couleurs vives" },
  { id: "CLASSIQUE", label: "Classique", desc: "Style traditionnel, sobre" },
  { id: "EPURE", label: "Épuré", desc: "Minimaliste, noir et blanc" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

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
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Modèles de documents</h2>
      <p className="mb-6 text-sm text-slate-600">
        Choisissez le style de vos devis et factures.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all sm:min-w-[140px] ${
              selected === s.id
                ? "border-zypta-blue bg-zypta-blue/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="font-medium text-slate-900">{s.label}</span>
            <span className="mt-1 text-xs text-slate-500">{s.desc}</span>
          </button>
        ))}
      </div>
      <Button className="mt-4" onClick={handleSave} disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}
