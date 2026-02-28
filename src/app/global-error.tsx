"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Erreur serveur</h1>
          <p className="text-slate-600 mb-6">
            Une erreur s&apos;est produite. Vérifiez la configuration Vercel.
          </p>
          <div className="text-left bg-slate-50 rounded-xl p-4 text-sm text-slate-700 mb-6">
            <p className="font-medium mb-2">Causes fréquentes :</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>DATABASE_URL</strong> manquant ou invalide</li>
              <li>Tables non créées (exécuter <code className="bg-slate-200 px-1 rounded">prisma db push</code>)</li>
              <li>Connexion pool requise (Neon : ajouter <code className="bg-slate-200 px-1 rounded">?pgbouncer=true</code>)</li>
              <li><strong>NEXTAUTH_SECRET</strong> et <strong>NEXTAUTH_URL</strong> requis</li>
            </ul>
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 bg-zypta-blue text-white rounded-xl font-medium hover:bg-zypta-blue/90"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
