import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingLogo } from "@/components/ui/LandingLogo";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-slate-900 px-6 py-4 ring-1 ring-supernova/20">
              <LandingLogo />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-supernova">Zypta BTP</h1>
        </div>
        <p className="mt-2 text-slate-300">Le cockpit des artisans du bâtiment</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild className="bg-supernova text-slate-900 hover:bg-supernova-dark">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button variant="outline" asChild className="border-supernova/50 text-supernova hover:bg-supernova/10">
            <Link href="/register">S&apos;inscrire</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
