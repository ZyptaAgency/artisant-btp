"use client";

import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const { locale, setLocale } = useLanguage();

  return (
    <header className="header-zypta sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 p-0.5">
          <Globe className="ml-2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <button
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
        <div className="h-5 w-px bg-[var(--border)]" />
        <span className="text-sm font-medium text-[var(--text-muted)]">
          {session?.user?.name ?? session?.user?.email}
        </span>
      </div>
    </header>
  );
}
