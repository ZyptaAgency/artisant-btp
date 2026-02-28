"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, GitBranch, FileText, Receipt } from "lucide-react";

const items = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/clients", icon: Users },
  { href: "/pipeline", icon: GitBranch },
  { href: "/devis", icon: FileText },
  { href: "/factures", icon: Receipt },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav-zypta fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border)] py-2 md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-all",
              isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </nav>
  );
}
