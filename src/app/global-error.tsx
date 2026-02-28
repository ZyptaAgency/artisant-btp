"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const logText = [
    `Message: ${error?.message ?? "N/A"}`,
    `Digest: ${error?.digest ?? "N/A"}`,
    error?.stack ? `Stack:\n${error.stack}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(logText);
  };

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[var(--bg-card)] rounded-2xl shadow-lg p-8">
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2 text-center">Erreur serveur</h1>
          <p className="text-[var(--text-muted)] mb-4 text-center">
            Copie les logs ci-dessous pour le débogage :
          </p>
          <div className="relative mb-6">
            <pre className="bg-[var(--bg-elevated)] text-[var(--text-white)] rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
              {logText || "Aucun détail disponible"}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-white text-xs rounded-lg"
            >
              Copier
            </button>
          </div>
          <div className="text-left bg-white/5 rounded-xl p-4 text-sm text-[var(--text-muted)] mb-6">
            <p className="font-medium mb-2">Causes fréquentes :</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>DATABASE_URL</strong> manquant ou invalide</li>
              <li>Tables non créées (exécuter <code className="bg-white/5 px-1 rounded">prisma db push</code>)</li>
              <li>Connexion pool requise (Neon : ajouter <code className="bg-white/5 px-1 rounded">?pgbouncer=true</code>)</li>
              <li><strong>NEXTAUTH_SECRET</strong> et <strong>NEXTAUTH_URL</strong> requis</li>
            </ul>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4 text-center">
            Si le bloc ci-dessus est vide, consulte les logs Vercel : Deployments → ton déploiement → Functions / Logs
          </p>
          <div className="text-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-nova-mid text-white rounded-xl font-medium hover:bg-nova-mid/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
