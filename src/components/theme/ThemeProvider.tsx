"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    function applyTheme(theme: string) {
      const html = document.documentElement;
      html.removeAttribute("data-theme");
      if (theme === "systeme") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        html.setAttribute("data-theme", dark ? "noir" : "blanc");
      } else {
        html.setAttribute("data-theme", theme);
      }
    }

    async function loadTheme() {
      if (status !== "authenticated") {
        applyTheme("supernova");
        return;
      }
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const { theme } = await res.json();
          applyTheme(theme ?? "supernova");
        } else {
          applyTheme("supernova");
        }
      } catch {
        applyTheme("supernova");
      }
    }

    loadTheme();

    const handler = () => loadTheme();
    window.addEventListener("theme-changed", handler);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handler);
    return () => {
      window.removeEventListener("theme-changed", handler);
      mq.removeEventListener("change", handler);
    };
  }, [status]);

  return <>{children}</>;
}
