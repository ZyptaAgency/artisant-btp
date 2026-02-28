"use client";

import { useState } from "react";
import {
  Building2,
  User,
  FileText,
  Library,
  Layout,
  Hash,
  Palette,
} from "lucide-react";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { DocumentModelForm } from "@/components/settings/DocumentModelForm";
import { ThemeForm } from "@/components/settings/ThemeForm";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "entreprise", label: "Mon entreprise", icon: Building2 },
  { id: "profil", label: "Mon profil", icon: User },
  { id: "apparence", label: "Apparence", icon: Palette },
  { id: "mentions", label: "Mentions légales", icon: FileText },
  { id: "prestations", label: "Bibliothèque de prestations", icon: Library },
  { id: "modeles", label: "Modèles de documents", icon: Layout },
  { id: "numerotation", label: "Numérotation", icon: Hash },
];

type UserData = {
  nom: string;
  entreprise: string;
  siret: string | null;
  identifiantType: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  logo: string | null;
  documentStyle: string;
  theme: string;
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
                    ? "bg-zypta-blue/10 text-zypta-blue dark:bg-zypta-blue/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
                  identifiantType: user.identifiantType === "BCE" ? "BCE" : "SIRET",
                  email: user.email,
                  telephone: user.telephone ?? "",
                  adresse: user.adresse ?? "",
                  logo: user.logo ?? "",
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

          {active === "apparence" && (
            <ThemeForm current={user.theme} />
          )}

          {active === "modeles" && (
            <DocumentModelForm current={user.documentStyle} />
          )}


          {active === "numerotation" && (
            <div className="transition-opacity duration-300">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Numérotation</h2>
              <p className="text-sm text-slate-600">
                Préfixes et séquences pour devis et factures.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
