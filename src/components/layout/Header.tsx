"use client";

import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="header-zypta sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[var(--text-muted)]">
          {session?.user?.name ?? session?.user?.email}
        </span>
      </div>
    </header>
  );
}
