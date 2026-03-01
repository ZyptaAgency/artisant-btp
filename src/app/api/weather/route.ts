import { NextResponse } from "next/server";

type CacheEntry = {
  data: { temperature: number; description: string; ville: string };
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Dégagé",
  1: "Peu nuageux",
  2: "Peu nuageux",
  3: "Peu nuageux",
  45: "Brouillard",
  48: "Brouillard",
  51: "Bruine",
  53: "Bruine",
  55: "Bruine",
  56: "Bruine",
  57: "Bruine",
  61: "Pluie",
  63: "Pluie",
  65: "Pluie",
  66: "Pluie",
  67: "Pluie",
  71: "Neige",
  73: "Neige",
  75: "Neige",
  77: "Neige",
  80: "Averses",
  81: "Averses",
  82: "Averses",
  85: "Neige",
  86: "Neige",
  95: "Orage",
  96: "Orage",
  99: "Orage",
};

function getDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Inconnu";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ville = searchParams.get("ville") || "Paris";
  const cacheKey = ville.toLowerCase().trim();

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=1&language=fr`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.length) {
      return NextResponse.json(
        { error: `Ville "${ville}" introuvable` },
        { status: 404 }
      );
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;

    const result = {
      temperature: Math.round(current.temperature),
      description: getDescription(current.weathercode),
      ville: name || ville,
    };

    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer la météo" },
      { status: 500 }
    );
  }
}
