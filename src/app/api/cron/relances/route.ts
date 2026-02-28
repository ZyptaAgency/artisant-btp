import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { addDays, subDays } from "date-fns";

// Vercel Cron: GET avec Authorization: Bearer CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // Devis envoyés il y a 3 jours sans réponse
  const dateJ3 = subDays(now, 3);

  const devisJ3 = await prisma.devis.findMany({
    where: {
      statut: "ENVOYE",
      dateValidite: { gte: now },
      createdAt: {
        gte: subDays(dateJ3, 1),
        lte: addDays(dateJ3, 1),
      },
    },
    include: { client: true },
  });

  if (devisJ3.length > 0) {
    for (const d of devisJ3) {
      const result = await sendEmail({
        to: d.client.email,
        type: "RELANCE_J3",
        data: { clientNom: d.client.nom, clientPrenom: d.client.prenom, numero: d.numero },
      });
      await prisma.email.create({
        data: {
          clientId: d.clientId,
          type: "RELANCE_J3",
          sujet: `Relance devis ${d.numero}`,
          contenu: result.success ? "Envoyé" : result.error ?? "Erreur",
          statut: result.success ? "ENVOYE" : "ERREUR",
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    relancesJ3: devisJ3.length,
  });
}
