"use client";

import { Suspense, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { StarField } from "@/components/ui/StarField";
import { Eye, EyeOff, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const PASSWORD_MIN_LENGTH = 8;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { t, locale, setLocale } = useLanguage();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < PASSWORD_MIN_LENGTH) {
      toast.error(t("auth.passwordMinChars"));
      return;
    }

    if (password !== confirm) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t("errors.serverError"));
        return;
      }

      setSuccess(true);
    } catch {
      toast.error(t("errors.connectionError"));
    } finally {
      setLoading(false);
    }
  }

  const langSelector = (
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
  );

  if (!token) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
        {langSelector}
        <StarField />
        <div className="relative z-10 mb-8">
          <Logo src="/logo.png" width={180} height={180} />
        </div>
        <Card className="relative z-10 w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {t("auth.invalidResetLink")}
            </p>
            <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-nova-mid hover:underline">
              {t("auth.requestNewLink")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
      {langSelector}
      <StarField />
      <div className="relative z-10 mb-8">
        <Logo src="/logo.png" width={180} height={180} />
      </div>
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.resetPasswordTitle")}</CardTitle>
          <CardDescription>{t("auth.resetPasswordSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                {t("auth.resetSuccess")}
              </p>
              <Link href="/login" className="inline-block text-sm font-medium text-nova-mid hover:underline">
                {t("auth.login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {t("auth.passwordMinChars")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.resetPassword")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><span className="text-[var(--text-muted)]">Chargement...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
