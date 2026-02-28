# Zypta BTP

SaaS pour artisans et entreprises du bâtiment — cockpit de gestion : clients, devis, factures, pipeline, estimateur IA.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + PostgreSQL
- **NextAuth**

## Démarrage local

1. **Cloner et installer**
   ```bash
   git clone https://github.com/VOTRE_USER/artisant-btp.git
   cd artisant-btp
   npm install
   ```

2. **Base de données**
   ```bash
   # PostgreSQL (Docker)
   docker run -d -p 5433:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=artisan_btp postgres:15

   # Prisma
   cp .env.example .env
   # Éditer .env avec DATABASE_URL
   npx prisma db push
   npx prisma db seed
   ```

3. **Variables d'environnement** (`.env`)
   - `DATABASE_URL` — URL PostgreSQL
   - `NEXTAUTH_URL` — URL de l'app (ex: `https://votre-app.vercel.app`)
   - `NEXTAUTH_SECRET` — générer avec `openssl rand -base64 32`
   - `RESEND_API_KEY` — optionnel (emails)
   - `OPENAI_API_KEY` — optionnel (estimateur IA)

4. **Lancer**
   ```bash
   npm run dev
   ```

## Déploiement Vercel

1. Créer un projet sur [Vercel](https://vercel.com) et importer le dépôt GitHub
2. Ajouter une base de données **PostgreSQL** (Vercel Postgres, Neon, Supabase…)
3. Configurer les variables d'environnement dans Vercel
4. Déployer

## Compte démo

- **Email** : `demo@artisan-btp.fr`
- **Mot de passe** : `demo1234`
