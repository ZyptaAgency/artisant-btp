"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LandingContent } from "./LandingContent";
import { StarField } from "@/components/ui/StarField";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const { t, locale, setLocale } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg)] overflow-hidden">
      <header className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Zypta BTP" className="h-10 md:h-12" />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 p-0.5">
            <Globe className="ml-2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <button
              type="button"
              onClick={() => setLocale("fr")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
                locale === "fr"
                  ? "bg-[var(--accent)] text-white shadow-[0_0_10px_var(--ring)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              )}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
                locale === "en"
                  ? "bg-[var(--accent)] text-white shadow-[0_0_10px_var(--ring)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              )}
            >
              EN
            </button>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {t("landing.login")}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[0_0_15px_var(--ring)] transition-all hover:shadow-[0_0_25px_var(--ring)]"
          >
            {t("landing.register")}
          </Link>
        </nav>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center p-4">
        <StarField />
        <LandingContent />
      </main>
    </div>
  );
}
