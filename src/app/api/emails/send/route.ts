import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, type EmailType } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  clientId: z.string(),
  type: z.enum([
    "CONFIRMATION_DEVIS",
    "RELANCE_J3",
    "RELANCE_J7",
    "RELANCE_J15",
    "ENVOI_FACTURE",
    "DEMANDE_AVIS",
  ]),
  numero: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { clientId, type, numero } = schema.parse(body);

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    const result = await sendEmail({
      to: client.email,
      type: type as EmailType,
      data: {
        clientNom: client.nom,
        clientPrenom: client.prenom,
        ...(numero && { numero }),
      },
    });

    if (!result.success) {
      await prisma.email.create({
        data: {
          clientId,
          type: type as EmailType,
          sujet: `Erreur ${type}`,
          contenu: result.error ?? "Erreur inconnue",
          statut: "ERREUR",
        },
      });
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const sujet = type.replace(/_/g, " ") + (numero ? ` - ${numero}` : "");
    await prisma.email.create({
      data: {
        clientId,
        type: type as EmailType,
        sujet,
        contenu: `Email envoyé (${type})`,
        statut: "ENVOYE",
      },
    });

    return NextResponse.json({ success: true });
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
