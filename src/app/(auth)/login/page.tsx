"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCsrfToken } from "next-auth/react";
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

const AUTH_TIMEOUT_MS = 60000;

async function signInWithTimeout(
  email: string,
  password: string,
  callbackUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const csrfToken = await getCsrfToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        csrfToken: csrfToken ?? "",
        email,
        password,
        callbackUrl,
        json: "true",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = (await res.json()) as { url?: string };
    const error = data?.url ? new URL(data.url).searchParams.get("error") : null;
    return { ok: res.ok, error: error ?? undefined };
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const warmupRef = useRef(fetch("/api/warmup").catch(() => {}));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") ?? "/dashboard");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await warmupRef.current;
      const res = await signInWithTimeout(email, password, callbackUrl);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(t("errors.connectionError"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errors.connectionError");
      toast.error(msg);
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
          <CardTitle className="text-2xl">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
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
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-nova-mid hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-medium text-nova-mid hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
