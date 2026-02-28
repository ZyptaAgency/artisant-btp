"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

function applyTheme(theme: string) {
  const html = document.documentElement;
  if (theme === "systeme") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-theme", dark ? "noir" : "blanc");
  } else {
    html.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      applyTheme("supernova");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (cancelled) return;
        if (res.ok) {
          const { theme } = await res.json();
          applyTheme(theme ?? "supernova");
        } else {
          applyTheme("supernova");
        }
      } catch {
        if (!cancelled) applyTheme("supernova");
      }
    })();

    return () => { cancelled = true; };
  }, [status]);

  useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const { theme } = await res.json();
          applyTheme(theme ?? "supernova");
        }
      } catch { /* keep current */ }
    };

    window.addEventListener("theme-changed", handler);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => {
      window.removeEventListener("theme-changed", handler);
      mq.removeEventListener("change", handler);
    };
  }, []);

  return <>{children}</>;
}
