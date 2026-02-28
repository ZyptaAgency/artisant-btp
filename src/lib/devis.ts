import { prisma } from "./db";

export async function getNextDevisNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;

  const last = await prisma.devis.findFirst({
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
