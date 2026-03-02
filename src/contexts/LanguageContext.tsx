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

type TransitionPhase = "idle" | "slide-out" | "slide-in";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<"left" | "right">("left");
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
    const dir = l === "en" ? "left" : "right";
    setDirection(dir);
    setPhase("slide-out");

    setTimeout(() => {
      setLocaleState(l);
      localStorage.setItem("zypta-locale", l);
      setPhase("slide-in");

      setTimeout(() => setPhase("idle"), 250);
    }, 200);
  }

  function tFn(key: TranslationKey, params?: Record<string, string | number>) {
    return translate(key, locale, params);
  }

  const slideStyle: React.CSSProperties =
    phase === "slide-out"
      ? {
          transition: "transform 200ms ease-in, opacity 200ms ease-in",
          transform: `translateX(${direction === "left" ? "-30px" : "30px"})`,
          opacity: 0,
        }
      : phase === "slide-in"
        ? {
            transition: "transform 250ms ease-out, opacity 250ms ease-out",
            transform: "translateX(0)",
            opacity: 1,
          }
        : {
            transform: "translateX(0)",
            opacity: 1,
          };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: tFn }}>
      <div style={slideStyle}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
