import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LandingLogo } from "@/components/ui/LandingLogo";
import { StarField } from "@/components/ui/StarField";
import { LandingContent } from "@/components/ui/LandingContent";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden" style={{ background: "#03010a" }}>
      <StarField />
      <LandingContent />
    </div>
  );
}
