import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PRIX_REF: Record<string, { prixM2?: number; prixForfait?: number }> = {
  "Rénovation salle de bain": { prixM2: 800 },
  "Rénovation cuisine": { prixM2: 1200 },
  Carrelage: { prixM2: 80 },
  Plomberie: { prixForfait: 2500 },
  Électricité: { prixM2: 120 },
  Peinture: { prixM2: 35 },
  Menuiserie: { prixM2: 200 },
  "Gros œuvre": { prixM2: 150 },
};

const SYSTEM_PROMPT = `Tu es un expert BTP spécialisé dans l'estimation de coûts de travaux en France, Belgique et Suisse.
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte autour) au format:
{
  "mainOeuvre": <nombre entier en euros>,
  "fournitures": <nombre entier en euros>,
  "marge": <nombre entier en euros>,
  "total": <nombre entier en euros>,
  "details": "<explication courte de 2-3 phrases>"
}
Base tes estimations sur les prix moyens du marché actuels. Sois réaliste et précis.`;

function buildUserPrompt(typeTravaux: string, surface: number | null, localisation: string) {
  return `Estime le coût pour: ${typeTravaux}${surface ? `, ${surface} m²` : ""}${localisation ? `, à ${localisation}` : ", en France"}. Décompose en main d'œuvre, fournitures et marge (environ 15%).`;
}

function parseAIResponse(text: string): { mainOeuvre: number; fournitures: number; marge: number; total: number; details: string } | null {
  try {
    const cleaned = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.mainOeuvre === "number" && typeof parsed.total === "number") {
      return {
        mainOeuvre: Math.round(parsed.mainOeuvre),
        fournitures: Math.round(parsed.fournitures),
        marge: Math.round(parsed.marge),
        total: Math.round(parsed.total),
        details: parsed.details || "",
      };
    }
  } catch { /* fallback */ }
  return null;
}

function staticEstimate(typeTravaux: string, surface: number | null, localisation: string) {
  const ref = PRIX_REF[typeTravaux] ?? { prixM2: 100 };
  let baseHT = 0;

  if (ref.prixForfait) {
    baseHT = ref.prixForfait;
  } else if (ref.prixM2 && surface) {
    baseHT = ref.prixM2 * surface;
  } else {
    baseHT = 5000;
  }

  let coef = 1;
  const loc = localisation?.toLowerCase() ?? "";
  if (loc.includes("paris")) coef = 1.2;
  else if (loc.includes("genève") || loc.includes("zurich")) coef = 1.4;
  else if (loc.includes("bruxelles")) coef = 1.1;
  else if (localisation) coef = 0.95;

  const mainOeuvre = Math.round(baseHT * 0.5 * coef);
  const fournitures = Math.round(baseHT * 0.35 * coef);
  const marge = Math.round((mainOeuvre + fournitures) * 0.15);
  const total = mainOeuvre + fournitures + marge;

  return {
    mainOeuvre,
    fournitures,
    marge,
    total,
    details: `${typeTravaux}${surface ? ` - ${surface} m²` : ""}${localisation ? ` - ${localisation}` : ""}. Estimation basée sur les prix moyens du marché.`,
  };
}

async function tryClaudeEstimate(typeTravaux: string, surface: number | null, localisation: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(typeTravaux, surface, localisation) }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (text) return parseAIResponse(text);
  } catch { /* fallback */ }
  return null;
}

async function tryOpenAIEstimate(typeTravaux: string, surface: number | null, localisation: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(typeTravaux, surface, localisation) },
        ],
        max_tokens: 400,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) return parseAIResponse(text);
  } catch { /* fallback */ }
  return null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { typeTravaux, surface, localisation } = await req.json();

    if (!typeTravaux) {
      return NextResponse.json({ error: "Type de travaux requis" }, { status: 400 });
    }

    const surfaceNum = surface ? Number(surface) : null;
    const loc = localisation || "France";

    const aiResult =
      (await tryClaudeEstimate(typeTravaux, surfaceNum, loc)) ??
      (await tryOpenAIEstimate(typeTravaux, surfaceNum, loc));

    if (aiResult) {
      return NextResponse.json(aiResult);
    }

    return NextResponse.json(staticEstimate(typeTravaux, surfaceNum, loc));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
