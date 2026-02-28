import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Prix moyens indicatifs BTP France (€/m² ou forfait)
const PRIX_REF: Record<string, { prixM2?: number; prixForfait?: number }> = {
  "Rénovation salle de bain": { prixM2: 800 },
  "Rénovation cuisine": { prixM2: 1200 },
  "Carrelage": { prixM2: 80 },
  "Plomberie": { prixForfait: 2500 },
  "Électricité": { prixM2: 120 },
  "Peinture": { prixM2: 35 },
  "Menuiserie": { prixM2: 200 },
  "Gros œuvre": { prixM2: 150 },
};

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

    const ref = PRIX_REF[typeTravaux] ?? { prixM2: 100 };
    let baseHT = 0;

    if (ref.prixForfait) {
      baseHT = ref.prixForfait;
    } else if (ref.prixM2 && surface) {
      baseHT = ref.prixM2 * Number(surface);
    } else {
      baseHT = 5000;
    }

    // Coefficient localisation (Paris +20%, province -5%)
    let coef = 1;
    if (localisation?.toLowerCase().includes("paris")) coef = 1.2;
    else if (localisation) coef = 0.95;

    const mainOeuvre = Math.round(baseHT * 0.5 * coef);
    const fournitures = Math.round(baseHT * 0.35 * coef);
    const marge = Math.round((mainOeuvre + fournitures) * 0.15);
    const total = mainOeuvre + fournitures + marge;

    // Appel OpenAI si clé configurée
    let details = `${typeTravaux}${surface ? ` - ${surface} m²` : ""}${localisation ? ` - ${localisation}` : ""}. Estimation basée sur les prix moyens du marché.`;
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
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
              {
                role: "system",
                content: `Tu es un expert BTP en France. Donne des estimations réalistes basées sur les prix moyens du marché. Réponds en 2-3 phrases maximum.`,
              },
              {
                role: "user",
                content: `Estimation pour: ${typeTravaux}, ${surface || "N/A"} m², ${localisation || "France"}. Fournis une estimation détaillée (main d'œuvre, fournitures) en quelques phrases.`,
              },
            ],
            max_tokens: 200,
          }),
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          details = data.choices[0].message.content;
        }
      } catch {
        // Fallback si OpenAI échoue
      }
    }

    return NextResponse.json({
      mainOeuvre,
      fournitures,
      marge,
      total,
      details,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
