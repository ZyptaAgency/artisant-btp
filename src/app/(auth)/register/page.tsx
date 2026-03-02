"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { StarField } from "@/components/ui/StarField";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nom: "",
    entreprise: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/warmup").catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? t("errors.generic"));
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error(t("auth.creatingAccount"));
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(t("errors.saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">{t("auth.fullName")}</Label>
              <Input
                id="nom"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.creatingAccount") : t("auth.register")}
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
