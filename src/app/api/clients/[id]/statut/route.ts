import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatutPipeline } from "@prisma/client";

const VALID_STATUTS: StatutPipeline[] = [
  "PROSPECT",
  "CONTACTE",
  "DEVIS_ENVOYE",
  "NEGOCIATION",
  "SIGNE",
  "EN_COURS",
  "TERMINE",
  "PERDU",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const { statut } = await req.json();

  if (!VALID_STATUTS.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  const updated = await prisma.client.update({
    where: { id },
    data: { statutPipeline: statut as StatutPipeline },
  });

  return NextResponse.json(updated);
}
