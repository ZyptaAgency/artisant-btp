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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/factures", label: "Factures", icon: Receipt },
  { href: "/estimateur", label: "Estimateur IA", icon: Sparkles },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-theme fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-700 bg-slate-900/98 backdrop-blur-sm md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-center border-b border-slate-200/80 dark:border-slate-700 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2">
            <img
              src="/zypta-logo.png"
              alt="Zypta"
              className="h-6 max-w-[90px] shrink-0 object-contain object-left logo-supernova-dark"
            />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-zypta px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
                  isActive
                    ? "bg-supernova/20 text-supernova shadow-sm ring-1 ring-supernova/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-supernova"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-700 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-supernova"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  );
}
