"use client";

import * as React from "react";
import { Calendar, ExternalLink, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type SyncProvider = "google" | "ical" | null;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function CalendarSyncButtons({
  onSync,
}: {
  onSync: (provider: SyncProvider) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => onSync("google")}
      >
        <GoogleIcon className="h-3.5 w-3.5" />
        Google
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => onSync("ical")}
      >
        <AppleIcon className="h-3.5 w-3.5" />
        iCal
      </Button>
    </div>
  );
}

export function CalendarSyncDialog({
  provider,
  onClose,
}: {
  provider: SyncProvider;
  onClose: () => void;
}) {
  const [icalUrl, setIcalUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [googleConnected, setGoogleConnected] = React.useState(false);
  const [icalSaved, setIcalSaved] = React.useState(false);

  const handleGoogleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const redirectUri = `${window.location.origin}/api/calendar/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    const popup = window.open(authUrl, "google-calendar-auth", "width=500,height=600");

    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        setGoogleConnected(true);
        toast.success("Google Calendar connecté avec succès");
      }
    }, 500);
  };

  const handleIcalSave = async () => {
    if (!icalUrl.trim()) {
      toast.error("Veuillez entrer une URL iCal");
      return;
    }

    try {
      new URL(icalUrl);
    } catch {
      toast.error("URL invalide");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/calendar/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: icalUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setIcalSaved(true);
      toast.success("Calendrier iCal synchronisé avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={provider !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--text-white)]">
            {provider === "google" ? (
              <>
                <GoogleIcon className="h-5 w-5" />
                Synchroniser Google Calendar
              </>
            ) : (
              <>
                <AppleIcon className="h-5 w-5" />
                Synchroniser Apple iCal
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {provider === "google" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 space-y-4"
            >
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-white)]">Google Calendar</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    googleConnected
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/5 text-[var(--text-muted)]"
                  }`}
                >
                  {googleConnected ? "Connecté" : "Non connecté"}
                </span>
              </div>

              <p className="text-sm text-[var(--text-muted)]">
                Connectez votre Google Calendar pour voir vos rendez-vous directement sur le
                tableau de bord.
              </p>

              <Button
                onClick={handleGoogleConnect}
                className="w-full gap-2"
                variant={googleConnected ? "secondary" : "default"}
              >
                {googleConnected ? (
                  <>
                    <Check className="h-4 w-4" />
                    Reconnexion
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Connecter Google Calendar
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {provider === "ical" && (
            <motion.div
              key="ical"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 space-y-4"
            >
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-white)]">Apple iCal</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    icalSaved
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/5 text-[var(--text-muted)]"
                  }`}
                >
                  {icalSaved ? "Connecté" : "Non connecté"}
                </span>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  <strong className="text-[var(--text-white)]">Comment obtenir votre URL iCal :</strong>
                  <br />
                  1. Ouvrez <strong>Apple Calendar</strong> (Calendrier)
                  <br />
                  2. Clic droit sur votre calendrier &rarr; <strong>Réglages du calendrier</strong>
                  <br />
                  3. Cochez &ldquo;Calendrier public&rdquo; et copiez l&apos;URL
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="https://p123-caldav.icloud.com/published/..."
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                />
                <Button
                  onClick={handleIcalSave}
                  className="w-full gap-2"
                  disabled={saving || !icalUrl.trim()}
                  variant={icalSaved ? "secondary" : "default"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : icalSaved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Mettre à jour
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1 text-[var(--text-muted)] hover:text-[var(--text-white)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
