export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { prisma } = await import("./src/lib/db");
      await prisma.$connect();
    } catch {
      // Ne pas bloquer le démarrage si la DB n'est pas prête
    }
  }
}
