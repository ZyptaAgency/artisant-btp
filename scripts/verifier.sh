#!/bin/bash
# Vérification complète du projet

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════"
echo "  Vérification CRM Artisan BTP"
echo "═══════════════════════════════════════"
echo ""

# Docker
echo "1. Docker"
if docker info > /dev/null 2>&1; then
  echo "   ✅ Docker démarré"
  docker compose ps 2>/dev/null | grep -q artisan-btp-db && echo "   ✅ PostgreSQL (artisan-btp-db) en cours d'exécution" || echo "   ⚠️  PostgreSQL non démarré - lancez: docker compose up -d"
else
  echo "   ❌ Docker non démarré - Ouvrez Docker Desktop"
fi
echo ""

# Port 5433
echo "2. Port 5433 (PostgreSQL)"
if lsof -i :5433 > /dev/null 2>&1; then
  echo "   ✅ Port 5433 utilisé (PostgreSQL actif)"
else
  echo "   ⚠️  Rien sur le port 5433 - PostgreSQL peut être arrêté"
fi
echo ""

# Port 3000
echo "3. Port 3000 (Next.js)"
if lsof -i :3000 > /dev/null 2>&1; then
  echo "   ✅ Port 3000 utilisé (serveur Next.js actif)"
else
  echo "   ⚠️  Rien sur le port 3000 - Lancez: npm run dev"
fi
echo ""

# .env
echo "4. Fichier .env"
if [ -f .env ]; then
  grep -q "DATABASE_URL" .env && echo "   ✅ DATABASE_URL défini" || echo "   ❌ DATABASE_URL manquant"
  grep -q "NEXTAUTH_SECRET" .env && echo "   ✅ NEXTAUTH_SECRET défini" || echo "   ❌ NEXTAUTH_SECRET manquant"
else
  echo "   ❌ Fichier .env absent"
fi
echo ""

# Test connexion
echo "5. Test de connexion"
if curl -s -o /dev/null -w "" http://localhost:3000 2>/dev/null; then
  echo "   ✅ http://localhost:3000 répond"
else
  echo "   ⚠️  http://localhost:3000 ne répond pas - le serveur est-il démarré ?"
fi
echo ""
echo "═══════════════════════════════════════"
