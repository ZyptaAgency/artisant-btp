import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const EMAIL_TYPES = [
  "CONFIRMATION_DEVIS",
  "RELANCE_J3",
  "RELANCE_J7",
  "RELANCE_J15",
  "ENVOI_FACTURE",
  "DEMANDE_AVIS",
] as const;

type EmailType = (typeof EMAIL_TYPES)[number];

const SUBJECTS: Record<EmailType, (numero?: string) => string> = {
  CONFIRMATION_DEVIS: (n) => `Confirmation devis${n ? ` ${n}` : ""}`,
  RELANCE_J3: (n) => `Relance devis${n ? ` ${n}` : ""}`,
  RELANCE_J7: (n) => `Rappel devis${n ? ` ${n}` : ""}`,
  RELANCE_J15: (n) => `Dernière relance devis${n ? ` ${n}` : ""}`,
  ENVOI_FACTURE: (n) => `Facture${n ? ` ${n}` : ""}`,
  DEMANDE_AVIS: () => "Votre avis compte",
};

function buildHtml(type: EmailType, prenom: string, nom: string, numero?: string): string {
  const greeting = `<p>Bonjour ${prenom} ${nom},</p>`;
  const footer = `<p>Cordialement,<br/>L'équipe Zypta BTP</p>`;

  const bodies: Record<EmailType, string> = {
    CONFIRMATION_DEVIS: `<p>Votre devis <strong>${numero ?? ""}</strong> a bien été enregistré.</p>`,
    RELANCE_J3: `<p>Nous revenons vers vous concernant le devis <strong>${numero ?? ""}</strong> envoyé récemment.</p>`,
    RELANCE_J7: `<p>Le devis <strong>${numero ?? ""}</strong> est en attente de votre retour. N&apos;hésitez pas à nous contacter.</p>`,
    RELANCE_J15: `<p>Dernière relance concernant le devis <strong>${numero ?? ""}</strong>. Sans nouvelles, il sera archivé.</p>`,
    ENVOI_FACTURE: `<p>Veuillez trouver ci-joint la facture <strong>${numero ?? ""}</strong>.</p>`,
    DEMANDE_AVIS: `<p>Nous espérons que notre prestation vous a donné satisfaction. Votre avis nous aiderait à nous améliorer.</p>`,
  };

  return greeting + bodies[type] + footer;
}

const schema = z.object({
  clientId: z.string(),
  type: z.enum(EMAIL_TYPES),
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

    const subject = SUBJECTS[type](numero);
    const html = buildHtml(type, client.prenom, client.nom, numero);

    let success = true;
    try {
      await sendEmail({ to: client.email, subject, html });
    } catch {
      success = false;
    }

    await prisma.email.create({
      data: {
        clientId,
        type,
        sujet: subject,
        contenu: success ? `Email envoyé (${type})` : "Erreur d'envoi",
        statut: success ? "ENVOYE" : "ERREUR",
      },
    });

    if (!success) {
      return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
    }

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
