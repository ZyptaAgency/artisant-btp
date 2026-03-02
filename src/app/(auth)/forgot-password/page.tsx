"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { StarField } from "@/components/ui/StarField";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || t("errors.serverError"));
        return;
      }

      setSent(true);
    } catch {
      toast.error(t("errors.connectionError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 p-0.5">
        <Globe className="ml-2 h-3.5 w-3.5 text-[var(--text-muted)]" />
        <button
          type="button"
          onClick={() => setLocale("fr")}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
            locale === "fr"
              ? "bg-[var(--accent)] text-white shadow-[0_0_10px_var(--ring)]"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          )}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200",
            locale === "en"
              ? "bg-[var(--accent)] text-white shadow-[0_0_10px_var(--ring)]"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          )}
        >
          EN
        </button>
      </div>
      <StarField />
      <div className="relative z-10 mb-8">
        <Logo src="/logo.png" width={180} height={180} />
      </div>
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.forgotPasswordTitle")}</CardTitle>
          <CardDescription>
            {t("auth.forgotPasswordSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                {t("auth.resetEmailSent")}
              </p>
              <Link href="/login" className="text-sm font-medium text-nova-mid hover:underline">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.sendResetLink")}
              </Button>
              <p className="text-center text-sm text-[var(--text-muted)]">
                <Link href="/login" className="font-medium text-nova-mid hover:underline">
                  {t("auth.backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
