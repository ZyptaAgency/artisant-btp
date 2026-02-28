#!/bin/bash
# Script de démarrage CRM Artisan BTP

cd "$(dirname "$0")/.."

echo "🔧 Artisan BTP - Vérification..."
echo ""

# 1. Vérifier Docker
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker n'est pas démarré. Ouvrez Docker Desktop et réessayez."
  exit 1
fi
echo "✅ Docker OK"

# 2. Démarrer PostgreSQL
echo "📦 Démarrage de PostgreSQL..."
docker compose up -d
sleep 3

# 3. Vérifier la base
if ! npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
  echo "❌ Impossible de se connecter à la base. Vérifiez que le conteneur tourne."
  exit 1
fi
echo "✅ Base de données OK"

# 4. Lancer l'app
echo ""
echo "🚀 Démarrage de l'application..."
echo "   → Ouvrez http://localhost:3000 dans votre navigateur"
echo "   → Compte démo: demo@artisan-btp.fr / demo1234"
echo ""
npm run dev
