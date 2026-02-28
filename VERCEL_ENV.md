# Variables d'environnement Vercel

Copie-colle ces variables dans **Vercel** → **Settings** → **Environment Variables**.

---

## Obligatoires

| Nom | Valeur (à remplir) |
|-----|--------------------|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&pgbouncer=true` |
| `NEXTAUTH_URL` | `https://ton-projet.vercel.app` |
| `NEXTAUTH_SECRET` | Génère avec : `openssl rand -base64 32` |

---

## Optionnelles

| Nom | Valeur |
|-----|--------|
| `RESEND_API_KEY` | `re_xxx` (emails) |
| `OPENAI_API_KEY` | `sk-xxx` (estimateur IA) |

---

## Format pour copier-coller

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&pgbouncer=true
NEXTAUTH_URL=https://ton-projet.vercel.app
NEXTAUTH_SECRET=COLLE_ICI_LE_RESULTAT_DE_openssl_rand_-base64_32
```

**Neon** : utilise l’URL avec `-pooler` dans l’hôte + `?pgbouncer=true`  
**Supabase** : utilise le pooler (port 6543) + `?pgbouncer=true`
