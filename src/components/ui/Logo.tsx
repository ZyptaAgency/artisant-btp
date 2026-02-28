"use client";

import { useEffect, useState } from "react";

type LogoVariant = "supernova" | "blanc" | "noir";

interface LogoProps {
  src?: string;
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
}

const variantStyles: Record<LogoVariant, React.CSSProperties> = {
  supernova: { background: "#FFD54F" },
  blanc: { background: "#ffffff" },
  noir: { background: "#0a0a0f" },
};

export function Logo({
  src = "/logo.png",
  variant,
  width = 140,
  height = 56,
  className = "",
}: LogoProps) {
  const [theme, setTheme] = useState<LogoVariant>("supernova");

  useEffect(() => {
    if (variant) {
      setTheme(variant);
      return;
    }
    const html = document.documentElement;
    const dataTheme = html.getAttribute("data-theme");
    // supernova (default) → or | noir (dark bg) → blanc (white logo) | blanc (light bg) → noir (black logo)
    if (dataTheme === "blanc") setTheme("noir");
    else if (dataTheme === "noir") setTheme("blanc");
    else setTheme("supernova");
  }, [variant]);

  useEffect(() => {
    if (variant) return;
    const observer = new MutationObserver(() => {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      if (dataTheme === "blanc") setTheme("noir");
      else if (dataTheme === "noir") setTheme("blanc");
      else setTheme("supernova");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [variant]);

  const style: React.CSSProperties = {
    width,
    height,
    ...variantStyles[theme],
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return (
    <div
      className={`shrink-0 ${className}`}
      style={style}
      role="img"
      aria-label="ZYPTA"
    />
  );
}
