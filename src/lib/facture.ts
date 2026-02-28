import { prisma } from "./db";

export async function getNextFactureNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

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
