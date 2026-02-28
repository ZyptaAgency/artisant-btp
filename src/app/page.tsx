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
    <div className="flex min-h-screen flex-col items-center justify-center p-4" style={{ background: "var(--bg, #03010a)" }}>
      <div className="text-center">
        <div className="flex flex-col items-center gap-6">
          <LandingLogo />
          <h1 className="text-3xl font-bold gradient-text">Zypta BTP</h1>
        </div>
        <p className="mt-2 text-[var(--text-muted)]">Le cockpit des artisans du bâtiment</p>
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
