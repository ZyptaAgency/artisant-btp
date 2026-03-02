"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
