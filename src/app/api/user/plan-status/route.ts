import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = "business@zypta.be";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, trialEndsAt: true, planStatus: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
  const isPaid = user.planStatus === "paid" || isAdmin;
  const trialEnded = user.trialEndsAt ? new Date(user.trialEndsAt) < new Date() : false;
  const canAccess = isPaid || !trialEnded;

  if (trialEnded && !isPaid) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { planStatus: "expired" },
    });
  }

  return NextResponse.json({
    planStatus: user.planStatus,
    trialEndsAt: user.trialEndsAt,
    canAccess,
    isAdmin,
  });
}
