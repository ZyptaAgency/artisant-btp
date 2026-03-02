"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ClientData = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresseChantier: string | null;
  notes: string | null;
  statutPipeline: string;
  devis: { id: string; numero: string; montantTTC: number; statut: string }[];
  factures: { id: string; numero: string; montantTTC: number; statut: string }[];
};

const STATUT_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTE: "Contacté",
  DEVIS_ENVOYE: "Devis envoyé",
  NEGOCIATION: "Négociation",
  SIGNE: "Signé",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  PERDU: "Perdu",
};

export function ClientDetailContent({ client }: { client: ClientData }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    nom: client.nom,
    prenom: client.prenom,
    email: client.email,
    telephone: client.telephone ?? "",
    adresseChantier: client.adresseChantier ?? "",
    notes: client.notes ?? "",
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone || undefined,
          adresseChantier: form.adresseChantier || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("clients.clientUpdated"));
      setEditing(false);
      router.refresh();
    } catch {
      toast.error(t("errors.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("clients.clientDeleted"));
      router.push("/clients");
    } catch {
      toast.error(t("errors.saveError"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {client.prenom} {client.nom}
            </h1>
            <p className="text-[var(--text-muted)]">
              {STATUT_LABELS[client.statutPipeline] ?? client.statutPipeline}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("clients.contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t("clients.firstName")}</Label>
                    <Input
                      value={form.prenom}
                      onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("clients.lastName")}</Label>
                    <Input
                      value={form.nom}
                      onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{t("auth.email")}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("clients.phone")}</Label>
                  <Input
                    value={form.telephone}
                    onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("clients.address")}</Label>
                  <Input
                    value={form.adresseChantier}
                    onChange={(e) => setForm((p) => ({ ...p, adresseChantier: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("clients.notes")}</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="flex w-full rounded-md border border-[var(--border)] bg-[var(--bg-input,var(--bg-elevated))] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t("common.save")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm({
                        nom: client.nom,
                        prenom: client.prenom,
                        email: client.email,
                        telephone: client.telephone ?? "",
                        adresseChantier: client.adresseChantier ?? "",
                        notes: client.notes ?? "",
                      });
                      setEditing(false);
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                  <a href={`mailto:${client.email}`} className="text-nova-mid hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--text-muted)]" />
                    <a href={`tel:${client.telephone}`} className="text-[var(--text-muted)]">
                      {client.telephone}
                    </a>
                  </div>
                )}
                {client.adresseChantier && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)]">{client.adresseChantier}</span>
                  </div>
                )}
                {client.notes && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--text-muted)]">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("nav.devis")} ({client.devis.length})
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/devis/nouveau?clientId=${client.id}`}>{t("dashboard.newQuote")}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.devis.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">{t("clients.noQuotes")}</p>
              ) : (
                <ul className="space-y-2">
                  {client.devis.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/devis/${d.id}`}
                        className="flex justify-between text-sm hover:text-nova-mid"
                      >
                        <span>{d.numero}</span>
                        <span>{formatCurrency(d.montantTTC)} - {d.statut}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {t("nav.factures")} ({client.factures.length})
              </CardTitle>
              <Button size="sm" asChild>
                <Link href={`/factures/nouvelle?clientId=${client.id}`}>{t("dashboard.newInvoice")}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.factures.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">{t("clients.noInvoices")}</p>
              ) : (
                <ul className="space-y-2">
                  {client.factures.slice(0, 5).map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/factures/${f.id}`}
                        className="flex justify-between text-sm hover:text-nova-mid"
                      >
                        <span>{f.numero}</span>
                        <span>{formatCurrency(f.montantTTC)} - {f.statut}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">{t("clients.deleteClient")}</DialogTitle>
            <DialogDescription>
              {t("clients.deleteClientConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
