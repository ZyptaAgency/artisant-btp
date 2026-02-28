import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { StatutPipeline } from "@prisma/client";

const createClientSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresseChantier: z.string().optional(),
  notes: z.string().optional(),
  statutPipeline: z.nativeEnum(StatutPipeline).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const extended = searchParams.get("extended") === "1";

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: extended
      ? {
          factures: { select: { montantTTC: true, updatedAt: true } },
          devis: { select: { montantTTC: true, updatedAt: true } },
        }
      : undefined,
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...data,
        statutPipeline: data.statutPipeline ?? "PROSPECT",
        userId: session.user.id,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
