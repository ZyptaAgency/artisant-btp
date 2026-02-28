# Déploiement GitHub + Vercel

## 1. Créer le dépôt GitHub

1. Va sur [github.com/new](https://github.com/new)
2. Nom du repo : `artisant-btp` (ou `zypta-btp`)
3. **Ne coche pas** "Initialize with README"
4. Clique sur **Create repository**

## 2. Pousser le code sur GitHub

```bash
cd /Users/mahammoudboulale/artisant-btp

# Premier commit
git add -A
git commit -m "Initial commit - Zypta BTP"

git remote add origin https://github.com/ZyptaAgency/artisant-btp.git
git branch -M main
git push -u origin main
```

## 3. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec GitHub
2. **Add New Project** → Importe le repo `artisant-btp`
3. **Configure Project** :
   - Framework Preset : Next.js (détecté automatiquement)
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `.next`

4. **Variables d'environnement** (à ajouter avant de déployer) :

   | Variable | Valeur | Obligatoire |
   |----------|--------|-------------|
   | `DATABASE_URL` | URL PostgreSQL (Neon, Supabase, Vercel Postgres…) | ✅ |
   | `NEXTAUTH_URL` | `https://ton-projet.vercel.app` | ✅ |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ |
   | `RESEND_API_KEY` | Clé Resend (emails) | Optionnel |
   | `OPENAI_API_KEY` | Clé OpenAI (estimateur IA) | Optionnel |

5. Clique sur **Deploy**

## 4. Base de données pour Vercel

Options recommandées :

- **[Vercel Postgres](https://vercel.com/storage/postgres)** — intégré, simple
- **[Neon](https://neon.tech)** — gratuit. Utilise l’URL **pooled** et ajoute `?pgbouncer=true`
- **[Supabase](https://supabase.com)** — gratuit. Utilise le pooler (port 6543) avec `?pgbouncer=true`

Après création, copie l’URL de connexion dans `DATABASE_URL`.

## 5. Migrations Prisma en production

Après le premier déploiement, exécute les migrations :

```bash
# Avec l’URL de prod
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

**Si erreur "Application error"** : 1) Vérifier DATABASE_URL dans Vercel 2) Neon : ajouter `?pgbouncer=true` 3) Exécuter `prisma db push` 4) Vérifier NEXTAUTH_SECRET et NEXTAUTH_URL
