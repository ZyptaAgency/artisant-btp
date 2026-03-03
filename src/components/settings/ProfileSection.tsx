"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

export function ProfileSection({ email }: { email: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showEmailPw, setShowEmailPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
        toast.error(data.error || t("errors.saveError"));
        return;
      }

      toast.success(t("settings.accountDeleted"));
      await signOut({ redirect: false });
      router.push("/login");
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      toast.error(t("profileSection.fillAllFields"));
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
        toast.error(data.error || t("errors.saveError"));
        return;
      }

      toast.success(data.message);
      setNewEmail("");
      setEmailPassword("");
    } catch {
      toast.error(t("errors.networkError"));
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("profileSection.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("profileSection.passwordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("profileSection.passwordMinChars"));
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
        toast.error(data.error || t("errors.saveError"));
        return;
      }

      toast.success(t("profileSection.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("errors.networkError"));
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
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("profileSection.editEmail")}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {t("profileSection.currentEmail")} : <span className="text-[var(--foreground)]">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.newEmail")}</Label>
            <Input
              type="email"
              placeholder="nouveau@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.currentPassword")}</Label>
            <div className="relative">
              <Input
                type={showEmailPw ? "text" : "password"}
                placeholder={t("profileSection.confirmIdentity")}
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowEmailPw(!showEmailPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                {showEmailPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={emailLoading}>
            {emailLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profileSection.sending")}
              </>
            ) : (
              t("profileSection.sendConfirmationLink")
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
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("profileSection.editPassword")}</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.currentPassword")}</Label>
            <div className="relative">
              <Input
                type={showCurrentPw ? "text" : "password"}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.newPassword")}</Label>
            <div className="relative">
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.confirmNewPassword")}</Label>
            <div className="relative">
              <Input
                type={showConfirmPw ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={passwordLoading}>
            {passwordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profileSection.updating")}
              </>
            ) : (
              t("profileSection.updatePassword")
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
            <h3 className="text-sm font-semibold text-red-500">{t("settings.deleteAccount")}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {t("settings.deleteWarning")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          onClick={() => setDeleteOpen(true)}
        >
          {t("settings.deleteAccount")}
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
            <DialogTitle className="text-red-500">{t("settings.deleteAccount")}</DialogTitle>
            <DialogDescription>
              {t("settings.confirmDelete")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-[var(--text-muted)]">{t("profileSection.confirmation")}</Label>
            <Input
              placeholder={t("settings.deleteConfirmPlaceholder")}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== t("settings.deleteConfirmWord") || deleteLoading}
              onClick={handleDeleteAccount}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("settings.deleting")}
                </>
              ) : (
                t("settings.confirmDeleteBtn")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
