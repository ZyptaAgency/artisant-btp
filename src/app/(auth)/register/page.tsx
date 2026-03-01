"use client";

import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: "",
    entreprise: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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
        toast.error(data.error ?? "Erreur d'inscription");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error("Inscription réussie. Connectez-vous.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'inscription");
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
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>Créez votre espace artisan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entreprise">Nom de l&apos;entreprise</Label>
              <Input
                id="entreprise"
                value={form.entreprise}
                onChange={(e) => setForm((p) => ({ ...p, entreprise: e.target.value }))}
                placeholder="Dupont BTP"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-nova-mid hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
