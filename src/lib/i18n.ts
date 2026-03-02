export type Locale = "fr" | "en";

const translations = {
  fr: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.clients": "Clients",
    "nav.pipeline": "Pipeline",
    "nav.devis": "Devis",
    "nav.factures": "Factures",
    "nav.estimateur": "Estimateur IA",
    "nav.settings": "Paramètres",
    "nav.todos": "Tâches",
    "nav.logout": "Déconnexion",
    // Common
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.loading": "Chargement...",
    "common.noResults": "Aucun résultat",
    // Auth
    "auth.login": "Se connecter",
    "auth.register": "S'inscrire",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.hasAccount": "Déjà un compte ?",
    // Settings
    "settings.title": "Paramètres",
    "settings.profile": "Mon profil",
    "settings.company": "Entreprise",
    "settings.appearance": "Apparence",
    "settings.models": "Modèles de documents",
    "settings.language": "Langue",
    "settings.deleteAccount": "Supprimer mon compte",
    "settings.deleteWarning":
      "Cette action est irréversible. Toutes vos données seront supprimées.",
    "settings.deleteConfirmWord": "SUPPRIMER",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.clients": "Clients",
    "nav.pipeline": "Pipeline",
    "nav.devis": "Quotes",
    "nav.factures": "Invoices",
    "nav.estimateur": "AI Estimator",
    "nav.settings": "Settings",
    "nav.todos": "Tasks",
    "nav.logout": "Log out",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.noResults": "No results",
    "auth.login": "Log in",
    "auth.register": "Sign up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "No account yet?",
    "auth.hasAccount": "Already have an account?",
    "settings.title": "Settings",
    "settings.profile": "My profile",
    "settings.company": "Company",
    "settings.appearance": "Appearance",
    "settings.models": "Document templates",
    "settings.language": "Language",
    "settings.deleteAccount": "Delete my account",
    "settings.deleteWarning":
      "This action is irreversible. All your data will be deleted.",
    "settings.deleteConfirmWord": "DELETE",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["fr"];

export function t(key: TranslationKey, locale: Locale = "fr"): string {
  return translations[locale]?.[key] ?? translations.fr[key] ?? key;
}

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};
