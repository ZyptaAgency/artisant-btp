import { prisma } from "./db";

function getInitials(name: string): string {
  if (!name.trim()) return "XX";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "XX";
}

export async function getNextFactureNumber(userName: string): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const initials = getInitials(userName);
  const prefix = `F-${initials}-${yy}${mm}-`;

  const last = await prisma.facture.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
  });

  let seq = 1;
  if (last) {
    const match = last.numero.match(/-(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${seq.toString().padStart(3, "0")}`;
}
