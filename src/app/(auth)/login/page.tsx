"use client";

import { Suspense, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { StarField } from "@/components/ui/StarField";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginForm() {
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") ?? "/dashboard");
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
    if (params.get("registered") === "1") {
      toast.success(t("auth.signupSuccess"));
    }
    const error = params.get("error");
    if (error === "CredentialsSignin" || error === "Credentials") {
      toast.error(t("auth.wrongPassword"));
      const q = new URLSearchParams();
      if (emailParam) q.set("email", emailParam);
      const cb = params.get("callbackUrl");
      if (cb) q.set("callbackUrl", cb);
      router.replace("/login" + (q.toString() ? `?${q.toString()}` : ""), { scroll: false });
    }
  }, [searchParams, locale, t, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        toast.error(t("auth.wrongPassword"));
        return;
      }
      if (res?.ok && res?.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err) {
      console.error("[LOGIN]", err);
      toast.error(t("errors.connectionError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-4 overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 p-0.5 backdrop-blur-sm">
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
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8">
          <Logo src="/logo.png" variant="gradient" width={180} height={72} />
        </div>
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 shadow-[0_0_60px_rgba(200,75,255,0.12)] backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--text-white)]">{t("auth.loginTitle")}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t("auth.loginSubtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-muted)]">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[var(--border)] bg-white/5 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-muted)]">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[var(--border)] bg-white/5 pr-10 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
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
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[var(--accent)] hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#c84bff] to-[#ff2d8f] text-white shadow-[0_0_30px_rgba(200,75,255,0.35)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(200,75,255,0.5)] hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><span className="text-[var(--text-muted)]">Chargement...</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
