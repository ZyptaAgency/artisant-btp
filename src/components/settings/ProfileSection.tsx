"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Lock, Loader2, AlertTriangle } from "lucide-react";

export function ProfileSection({ email }: { email: string }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }

      toast.success("Compte supprimé avec succès");
      await signOut({ redirect: false });
      router.push("/login");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/user/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors du changement d'email");
        return;
      }

      toast.success(data.message);
      setNewEmail("");
      setEmailPassword("");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(newPassword)) {
      toast.error("Le mot de passe doit contenir un caractère spécial");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors du changement de mot de passe");
        return;
      }

      toast.success("Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Email change */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/15">
            <Mail className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Modifier l&apos;email</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Email actuel : <span className="text-[var(--foreground)]">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">Nouvel email</Label>
            <Input
              type="email"
              placeholder="nouveau@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">Mot de passe actuel</Label>
            <Input
              type="password"
              placeholder="Confirmez votre identité"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={emailLoading}>
            {emailLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              "Envoyer le lien de confirmation"
            )}
          </Button>
        </form>
      </div>

      {/* Password change */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/15">
            <Lock className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Modifier le mot de passe</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">Mot de passe actuel</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">Nouveau mot de passe</Label>
            <Input
              type="password"
              placeholder="Min. 8 caractères, 1 spécial"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={passwordLoading}>
            {passwordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour…
              </>
            ) : (
              "Mettre à jour le mot de passe"
            )}
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/50 bg-red-500/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-500">Supprimer mon compte</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => setDeleteOpen(true)}
        >
          Supprimer mon compte
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(open) => {
        setDeleteOpen(open);
        if (!open) {
          setDeleteConfirmation("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Supprimer mon compte</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données (devis, factures, clients) seront définitivement supprimées.
              Tapez <span className="font-bold text-[var(--foreground)]">SUPPRIMER</span> pour confirmer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-[var(--text-muted)]">Confirmation</Label>
            <Input
              placeholder="Tapez SUPPRIMER"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== "SUPPRIMER" || deleteLoading}
              onClick={handleDeleteAccount}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression…
                </>
              ) : (
                "Confirmer la suppression"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
