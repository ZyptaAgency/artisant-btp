import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { StatutPipeline } from "@prisma/client";

const updateClientSchema = z.object({
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresseChantier: z.string().optional(),
  notes: z.string().optional(),
  statutPipeline: z.nativeEnum(StatutPipeline).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    include: {
      devis: true,
      factures: true,
      emails: true,
      chantiers: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateClientSchema.parse(body);

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json(client);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
