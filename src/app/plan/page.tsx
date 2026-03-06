"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StarField } from "@/components/ui/StarField";
import { Logo } from "@/components/ui/Logo";
import { Mail } from "lucide-react";

export default function PlanPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const [planStatus, setPlanStatus] = useState<{ canAccess?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/user/plan-status")
      .then((res) => {
        if (res.status === 401) return null;
        return res.json();
      })
      .then((data) => setPlanStatus(data ?? { canAccess: false }))
      .catch(() => setPlanStatus({ canAccess: false }));
  }, []);

  if (planStatus?.canAccess) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
      <StarField />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        <Link href="/" className="mb-8">
          <Logo src="/logo.png" variant="gradient" width={180} height={72} />
        </Link>

        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 shadow-[0_0_60px_rgba(200,75,255,0.12)] backdrop-blur-xl text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            {locale === "fr"
              ? "Accès au module"
              : "Module access"}
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            {locale === "fr"
              ? "Pour acheter le module et débloquer l'accès complet, contacte-moi :"
              : "To purchase the module and unlock full access, contact me:"}
          </p>
          <a
            href="mailto:business@zypta.be"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)]/20 px-6 py-3 text-[var(--accent)] font-medium hover:bg-[var(--accent)]/30 transition-colors"
          >
            <Mail className="h-5 w-5" />
            business@zypta.be
          </a>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href="/"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
          >
            {locale === "fr" ? "Accueil" : "Home"}
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {locale === "fr" ? "Se connecter" : "Log in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
