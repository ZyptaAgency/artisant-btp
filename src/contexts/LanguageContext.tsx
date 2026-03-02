"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Locale, t as translate, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key, params) => translate(key, "fr", params),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [transitioning, setTransitioning] = useState(false);
  const isInitial = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem("zypta-locale") as Locale;
    if (saved && (saved === "fr" || saved === "en")) {
      setLocaleState(saved);
    }
    isInitial.current = false;
  }, []);

  function setLocale(l: Locale) {
    if (l === locale) return;
    setTransitioning(true);
    setTimeout(() => {
      setLocaleState(l);
      localStorage.setItem("zypta-locale", l);
      setTimeout(() => setTransitioning(false), 50);
    }, 150);
  }

  function tFn(key: TranslationKey, params?: Record<string, string | number>) {
    return translate(key, locale, params);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: tFn }}>
      <div
        style={{
          transition: "opacity 150ms ease-in-out",
          opacity: transitioning ? 0 : 1,
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
