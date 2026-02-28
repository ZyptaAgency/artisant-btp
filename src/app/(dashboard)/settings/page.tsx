import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ParametresZypta } from "@/components/settings/ParametresZypta";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600">Configurez Zypta comme vous le souhaitez</p>
      </div>

      <ParametresZypta
        user={{
          nom: user.nom,
          entreprise: user.entreprise,
          siret: user.siret,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse,
        }}
      />
    </div>
  );
}
