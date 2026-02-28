"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Send, FileText, Share2, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES_TRAVAUX = [
  "Rénovation salle de bain",
  "Rénovation cuisine",
  "Carrelage",
  "Plomberie",
  "Électricité",
  "Peinture",
  "Menuiserie",
  "Gros œuvre",
];

const GAMMES = [
  { id: "eco", label: "Éco", emoji: "🌱", coef: 0.85 },
  { id: "milieu", label: "Milieu", emoji: "⭐", coef: 1 },
  { id: "premium", label: "Premium", emoji: "💎", coef: 1.25 },
];

type Message = {
  role: "zypta" | "user";
  content: string;
  type?: "question" | "choices" | "gamme";
};

type Estimation = {
  mainOeuvre: number;
  fournitures: number;
  marge: number;
  total: number;
  details: string;
};

export function EstimateurZypta() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "zypta",
      content: "Salut ! 👋 Je suis Zypta, ton assistant estimation. C'est quoi le projet ?",
      type: "question",
    },
  ]);
  const [step, setStep] = useState<"projet" | "surface" | "gamme" | "ville" | "calcul" | "resultat">("projet");
  const [input, setInput] = useState("");
  const [typeTravaux, setTypeTravaux] = useState("");
  const [surface, setSurface] = useState("");
  const [gamme, setGamme] = useState("milieu");
  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState<Estimation | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addUserMessage(content: string) {
    setMessages((m) => [...m, { role: "user", content }]);
  }

  function addZyptaMessage(content: string, type?: "question" | "choices" | "gamme") {
    setMessages((m) => [...m, { role: "zypta", content, type }]);
  }

  async function handleSend() {
    const val = input.trim();
    if (!val && step !== "gamme" && step !== "ville") return;

    if (step === "projet") {
      const match = TYPES_TRAVAUX.find((t) => t.toLowerCase().includes(val.toLowerCase()));
      const chosen = match ?? val;
      setTypeTravaux(chosen);
      addUserMessage(chosen);
      setInput("");
      addZyptaMessage("Quelle surface en m² ?", "question");
      setStep("surface");
      return;
    }

    if (step === "surface") {
      const s = parseFloat(val.replace(",", "."));
      if (isNaN(s) || s <= 0) {
        addZyptaMessage("Indique une surface valide en m² (ex: 8)", "question");
        return;
      }
      setSurface(val);
      addUserMessage(`${val} m²`);
      setInput("");
      addZyptaMessage("Quel niveau de gamme ?", "gamme");
      setStep("gamme");
      return;
    }

    if (step === "ville") {
      addUserMessage(val || "Non précisé");
      setInput("");
      addZyptaMessage("Parfait ! Je calcule ton estimation... ⏳", "question");
      setStep("calcul");
      setLoading(true);

      try {
        const res = await fetch("/api/ai/estimer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typeTravaux,
            surface: parseFloat(surface),
            localisation: val || "France",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");

        const coef = GAMMES.find((g) => g.id === gamme)?.coef ?? 1;
        const adjusted = {
          mainOeuvre: Math.round(data.mainOeuvre * coef),
          fournitures: Math.round(data.fournitures * coef),
          marge: Math.round(data.marge * coef),
          total: Math.round(data.total * coef),
          details: data.details ?? "",
        };
        setEstimation(adjusted);
        setMessages((m) => [
          ...m,
          {
            role: "zypta",
            content: `Voici ton estimation pour ${typeTravaux} (${surface} m²) en gamme ${GAMMES.find((g) => g.id === gamme)?.label ?? "Milieu"} :`,
          },
        ]);
        setStep("resultat");
      } catch {
        addZyptaMessage("Oups, une erreur s'est produite. Réessaie !", "question");
        setStep("ville");
      } finally {
        setLoading(false);
      }
    }
  }

  function handleGammeSelect(id: string) {
    setGamme(id);
    const g = GAMMES.find((x) => x.id === id);
    addUserMessage(g ? `${g.emoji} ${g.label}` : id);
    addZyptaMessage("Ville du chantier ? (ou laisse vide pour France)", "question");
    setStep("ville");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h1 className="text-xl font-bold text-slate-900">Estimateur IA</h1>
          <p className="text-sm text-slate-600">
            Décrivez votre projet, Zypta vous donne une estimation en 30 secondes
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "zypta" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zypta-blue/10 p-1.5">
                    <img src="/zypta-logo.png" alt="Zypta" className="h-full w-full object-contain logo-supernova-dark" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-zypta-blue text-white"
                      : "bg-slate-100 text-slate-800"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.type === "gamme" && step === "gamme" && (
                    <div className="mt-3 flex gap-2">
                      {GAMMES.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleGammeSelect(g.id)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:border-zypta-blue/50 hover:bg-zypta-blue/5"
                        >
                          {g.emoji} {g.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zypta-blue/10 p-1.5">
                  <img src="/zypta-logo.png" alt="Zypta" className="h-full w-full object-contain logo-supernova-dark" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {estimation && (
              <div className="rounded-2xl border-2 border-zypta-ia/20 bg-gradient-to-br from-zypta-ia/5 to-transparent p-6">
                <div className="mb-4 flex items-center gap-2 text-zypta-ia">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Résultat</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatCurrency(estimation.total)}
                  </span>
                  <span className="text-slate-500">(fourchette estimée)</span>
                </div>
                <div className="mt-4 grid gap-2 gap-x-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-xs text-slate-500">Main d&apos;œuvre</p>
                    <p className="font-semibold">{formatCurrency(estimation.mainOeuvre)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-xs text-slate-500">Matériaux</p>
                    <p className="font-semibold">{formatCurrency(estimation.fournitures)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-xs text-slate-500">Marge</p>
                    <p className="font-semibold">{formatCurrency(estimation.marge)}</p>
                  </div>
                </div>
                {estimation.details && (
                  <p className="mt-4 text-sm text-slate-600">{estimation.details}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => router.push("/devis/nouveau")}
                    className="bg-zypta-blue"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Transformer en devis
                  </Button>
                  <Button variant="outline" size="sm">
                    <Sliders className="mr-2 h-4 w-4" />
                    Ajuster
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <h2 className="mb-2 text-xs font-medium text-slate-500">Prix actualisés</h2>
          <div className="flex gap-2">
            <Input
              placeholder={
                step === "projet"
                  ? "Ex: Rénovation salle de bain"
                  : step === "surface"
                    ? "Surface en m²"
                    : step === "gamme"
                      ? "Sélectionnez la gamme ci-dessus"
                      : step === "ville"
                        ? "Ville ou laisser vide"
                        : ""
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={step === "gamme" || loading}
              className="flex-1 rounded-xl border-slate-200"
            />
            <Button
              onClick={handleSend}
              disabled={loading || step === "gamme" || ((step === "projet" || step === "surface") && !input.trim())}
              className="rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

