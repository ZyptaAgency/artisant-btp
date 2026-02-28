import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-zypta-blue/5 p-4">
      <div className="text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center">
            <img
              src="/zypta-logo.png"
              alt="Zypta"
              className="h-16 w-auto max-w-[200px] object-contain logo-supernova"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Zypta BTP</h1>
        </div>
        <p className="mt-2 text-slate-600">Le cockpit des artisans du bâtiment</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">S&apos;inscrire</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
