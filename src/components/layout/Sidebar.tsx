"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  GitBranch,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const navItems: {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
}[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/clients", labelKey: "nav.clients", icon: Users },
  { href: "/pipeline", labelKey: "nav.pipeline", icon: GitBranch },
  { href: "/devis", labelKey: "nav.devis", icon: FileText },
  { href: "/factures", labelKey: "nav.factures", icon: Receipt },
  { href: "/estimateur", labelKey: "nav.estimateur", icon: Sparkles },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="sidebar-zypta fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[var(--border)] md:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-center border-b border-[var(--border)] px-4 py-5">
          <Link href="/dashboard" className="block">
            <Logo src="/logo.png" width={150} height={100} />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_20px_var(--ring)]"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/5"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-[var(--text-muted)] hover:text-[var(--foreground)]"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
