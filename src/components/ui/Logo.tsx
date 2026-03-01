"use client";

import { useEffect, useState } from "react";

type LogoVariant = "gradient" | "blanc" | "noir";

interface LogoProps {
  src?: string;
  variant?: LogoVariant;
  width?: number;
  height?: number;
  className?: string;
}

const variantStyles: Record<LogoVariant, React.CSSProperties> = {
  gradient: { background: "linear-gradient(135deg, #ff6b35, #c84bff, #00d4ff)" },
  blanc: { background: "#ffffff" },
  noir: { background: "#0a0a0f" },
};

function resolveVariant(dataTheme: string | null): LogoVariant {
  if (dataTheme === "blanc") return "noir";
  if (dataTheme === "noir") return "blanc";
  return "gradient";
}

export function Logo({
  src = "/logo-new.png",
  variant,
  width = 160,
  height = 64,
  className = "",
}: LogoProps) {
  const [resolved, setResolved] = useState<LogoVariant>(variant ?? "gradient");

  useEffect(() => {
    if (variant) { setResolved(variant); return; }
    setResolved(resolveVariant(document.documentElement.getAttribute("data-theme")));
  }, [variant]);

  useEffect(() => {
    if (variant) return;
    const observer = new MutationObserver(() => {
      setResolved(resolveVariant(document.documentElement.getAttribute("data-theme")));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [variant]);

  const style: React.CSSProperties = {
    width,
    height,
    ...variantStyles[resolved],
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
