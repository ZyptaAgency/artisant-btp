-- Exécuter ce script dans Neon : SQL Editor
-- Ajoute les colonnes identifiantType, documentStyle, theme

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "identifiantType" TEXT DEFAULT 'SIRET';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "documentStyle" TEXT DEFAULT 'MODERNE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "theme" TEXT DEFAULT 'supernova';
