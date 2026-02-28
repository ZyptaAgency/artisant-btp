"use client";

import { useState } from "react";
import {
  Building2,
  User,
  FileText,
  Library,
  Layout,
  Hash,
  Plug,
  CreditCard,
} from "lucide-react";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "entreprise", label: "Mon entreprise", icon: Building2 },
  { id: "profil", label: "Mon profil", icon: User },
  { id: "mentions", label: "Mentions légales", icon: FileText },
  { id: "prestations", label: "Bibliothèque de prestations", icon: Library },
  { id: "modeles", label: "Modèles de documents", icon: Layout },
  { id: "numerotation", label: "Numérotation", icon: Hash },
  { id: "integrations", label: "Intégrations", icon: Plug },
  { id: "abonnement", label: "Abonnement", icon: CreditCard },
];

type UserData = {
  nom: string;
  entreprise: string;
  siret: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
};

export function ParametresZypta({ user }: { user: UserData }) {
  const [active, setActive] = useState("entreprise");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="w-full shrink-0 lg:w-56">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                  active === s.id
                    ? "bg-zypta-blue/10 text-zypta-blue"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {active === "entreprise" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Mon entreprise</h2>
              <p className="mb-6 text-sm text-slate-600">
                Informations affichées sur les devis et factures
              </p>
              <ProfileForm
                defaultValues={{
                  nom: user.nom,
                  entreprise: user.entreprise,
                  siret: user.siret ?? "",
                  email: user.email,
                  telephone: user.telephone ?? "",
                  adresse: user.adresse ?? "",
                }}
              />
            </div>
          )}

          {active === "profil" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Mon profil</h2>
              <p className="text-sm text-slate-600">
                Gestion du compte et des préférences personnelles.
              </p>
            </div>
          )}

          {active === "mentions" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Mentions légales</h2>
              <p className="text-sm text-slate-600">
                Personnalisez les mentions légales par défaut sur vos documents.
              </p>
            </div>
          )}

          {active === "prestations" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Bibliothèque de prestations</h2>
              <p className="mb-4 text-sm text-slate-600">
                Gérez vos postes récurrents (nom, unité, prix unitaire HT).
              </p>
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Bientôt disponible — import Excel et génération IA.
              </p>
            </div>
          )}

          {active === "modeles" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Modèles de documents</h2>
              <p className="text-sm text-slate-600">
                Choisissez le style de vos devis et factures (Moderne, Classique, Épuré).
              </p>
            </div>
          )}

          {active === "numerotation" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Numérotation</h2>
              <p className="text-sm text-slate-600">
                Préfixes et séquences pour devis et factures.
              </p>
            </div>
          )}

          {active === "integrations" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Intégrations</h2>
              <p className="mb-4 text-sm text-slate-600">
                Connectez vos outils : comptabilité, banque, calendrier.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Pennylane", "Tiime", "Google Calendar", "Stripe"].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <span className="font-medium">{name}</span>
                    <div className="h-6 w-12 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "abonnement" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Abonnement</h2>
              <p className="mb-4 text-sm text-slate-600">
                Plan actuel et usage du mois.
              </p>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium">Plan Pro</p>
                <p className="text-sm text-slate-500">12/50 devis ce mois</p>
                <button className="mt-2 text-sm font-medium text-zypta-blue hover:underline">
                  Voir les plans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
