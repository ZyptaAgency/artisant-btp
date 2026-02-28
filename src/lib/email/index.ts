// @ts-ignore - Resend peut ne pas être installé en dev
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailType =
  | "CONFIRMATION_DEVIS"
  | "RELANCE_J3"
  | "RELANCE_J7"
  | "RELANCE_J15"
  | "ENVOI_FACTURE"
  | "DEMANDE_AVIS";

const TEMPLATES: Record<
  EmailType,
  (data: { clientNom: string; clientPrenom: string; [key: string]: string }) => { subject: string; html: string }
> = {
  CONFIRMATION_DEVIS: ({ clientNom, clientPrenom, numero }) => ({
    subject: `Devis ${numero} - Confirmation`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Nous vous confirmons la réception de votre demande de devis.</p>
      <p>Nous vous avons envoyé le devis n°${numero}. N'hésitez pas à nous contacter pour toute question.</p>
      <p>Cordialement,</p>
    `,
  }),
  RELANCE_J3: ({ clientNom, clientPrenom, numero }) => ({
    subject: `Relance - Devis ${numero}`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Nous vous relançons concernant le devis n°${numero} que nous vous avons transmis.</p>
      <p>Nous restons à votre disposition pour toute question.</p>
      <p>Cordialement,</p>
    `,
  }),
  RELANCE_J7: ({ clientNom, clientPrenom, numero }) => ({
    subject: `Relance - Devis ${numero}`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Nous vous relançons une nouvelle fois concernant le devis n°${numero}.</p>
      <p>Nous restons à votre disposition.</p>
      <p>Cordialement,</p>
    `,
  }),
  RELANCE_J15: ({ clientNom, clientPrenom, numero }) => ({
    subject: `Dernière relance - Devis ${numero}`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Nous effectuons une dernière relance concernant le devis n°${numero}.</p>
      <p>Nous vous remercions de nous faire part de votre décision.</p>
      <p>Cordialement,</p>
    `,
  }),
  ENVOI_FACTURE: ({ clientNom, clientPrenom, numero }) => ({
    subject: `Facture ${numero}`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Veuillez trouver ci-joint votre facture n°${numero}.</p>
      <p>Merci de procéder au règlement dans les délais indiqués.</p>
      <p>Cordialement,</p>
    `,
  }),
  DEMANDE_AVIS: ({ clientNom, clientPrenom }) => ({
    subject: `Votre avis nous intéresse`,
    html: `
      <p>Bonjour ${clientPrenom} ${clientNom},</p>
      <p>Nous espérons que vous êtes satisfait de notre prestation.</p>
      <p>Votre avis nous serait précieux pour nous améliorer.</p>
      <p>Merci et à bientôt,</p>
    `,
  }),
};

export async function sendEmail({
  to,
  type,
  data,
}: {
  to: string;
  type: EmailType;
  data: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  const template = TEMPLATES[type](data as { clientNom: string; clientPrenom: string; [key: string]: string });
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  if (!resend) {
    console.log("[DEV] Email non envoyé (pas de RESEND_API_KEY):", { to, type, subject: template.subject });
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: template.subject,
      html: template.html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export { TEMPLATES };
