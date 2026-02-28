"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DevisForm } from "@/components/forms/DevisForm";
import { toast } from "sonner";

export default function NouveauDevisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("clientId") ?? undefined;

  function handleSuccess(devis: { id: string }) {
    toast.success("Devis créé");
    router.push(`/devis/${devis.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nouveau devis</h1>
        <p className="text-slate-600">Créez un nouveau devis</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <DevisForm clientId={clientId} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
