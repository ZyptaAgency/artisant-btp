"use client";

import { Suspense, useState, useEffect } from "react";
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

function RegisterForm() {
  const { t, locale, setLocale } = useLanguage();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    nom: "",
    entreprise: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    const email = searchParams.get("email");
    if (email) setForm((p) => ({ ...p, email }));
    if (error) {
      const msg = error === "email_exists" ? "Un compte existe déjà avec cet email" : decodeURIComponent(error);
      toast.error(msg);
    }
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    if (form.password.length < 8) {
      e.preventDefault();
      toast.error("Minimum 8 caractères");
      return;
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
          <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/register" method="POST" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">{t("auth.fullName")}</Label>
              <Input
                id="nom"
                name="nom"
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entreprise">{t("auth.companyName")}</Label>
              <Input
                id="entreprise"
                name="entreprise"
                value={form.entreprise}
                onChange={(e) => setForm((p) => ({ ...p, entreprise: e.target.value }))}
                placeholder="Dupont BTP"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="vous@exemple.fr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                  minLength={8}
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
            </div>
            <Button type="submit" className="w-full">
              {t("auth.register")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-medium text-nova-mid hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><span className="text-[var(--text-muted)]">Chargement...</span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
