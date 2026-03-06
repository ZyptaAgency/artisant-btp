"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/plan") return;

    fetch("/api/user/plan-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.canAccess === false) {
          router.replace("/plan");
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  return <>{children}</>;
}
