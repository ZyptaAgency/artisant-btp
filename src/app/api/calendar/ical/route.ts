import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  url: z
    .string()
    .url("URL invalide")
    .refine(
      (url) =>
        url.startsWith("https://") ||
        url.startsWith("http://") ||
        url.startsWith("webcal://"),
      "L'URL doit commencer par https://, http:// ou webcal://"
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = schema.parse(body);

    // TODO: Store iCal URL in DB and fetch/parse events
    console.log("iCal URL saved:", url);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
