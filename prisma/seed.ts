import { PrismaClient, StatutPipeline, StatutDevis, StatutFacture, UniteMesure } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Nettoyer les données de démo existantes
  await prisma.ligneFacture.deleteMany({});
  await prisma.ligneDevis.deleteMany({});
  await prisma.facture.deleteMany({});
  await prisma.devis.deleteMany({});
  await prisma.email.deleteMany({});
  await prisma.chantier.deleteMany({});
  await prisma.client.deleteMany({});

  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@artisan-btp.fr" },
    update: {},
    create: {
      nom: "Jean Dupont",
      entreprise: "Dupont BTP",
      siret: "12345678901234",
      email: "demo@artisan-btp.fr",
      telephone: "06 12 34 56 78",
      adresse: "12 rue des Artisans, 75001 Paris",
      password: hashedPassword,
    },
  });

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "client-1" },
      update: {},
      create: {
        id: "client-1",
        nom: "Martin",
        prenom: "Sophie",
        email: "sophie.martin@email.fr",
        telephone: "06 11 22 33 44",
        adresseChantier: "5 avenue des Lilas, 69001 Lyon",
        notes: "Client sérieux, préfère les devis détaillés",
        statutPipeline: StatutPipeline.DEVIS_ENVOYE,
        userId: user.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-2" },
      update: {},
      create: {
        id: "client-2",
        nom: "Bernard",
        prenom: "Pierre",
        email: "pierre.bernard@email.fr",
        telephone: "06 55 66 77 88",
        adresseChantier: "22 rue du Commerce, 33000 Bordeaux",
        notes: "Rénovation complète appartement",
        statutPipeline: StatutPipeline.NEGOCIATION,
        userId: user.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-3" },
      update: {},
      create: {
        id: "client-3",
        nom: "Leroy",
        prenom: "Marie",
        email: "marie.leroy@email.fr",
        telephone: "06 99 88 77 66",
        adresseChantier: "8 impasse des Roses, 31000 Toulouse",
        notes: "Nouveau prospect",
        statutPipeline: StatutPipeline.PROSPECT,
        userId: user.id,
      },
    }),
  ]);

  const devis1 = await prisma.devis.create({
    data: {
      numero: "DEV-2025-001",
      clientId: clients[0].id,
      montantHT: 8500,
      tva: 1700,
      montantTTC: 10200,
      statut: StatutDevis.ENVOYE,
      dateValidite: new Date("2025-03-15"),
      notes: "Rénovation salle de bain",
      userId: user.id,
      lignes: {
        create: [
          { description: "Démolition carrelage et placo", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 1200, tauxTVA: 20, montantHT: 1200 },
          { description: "Pose carrelage sol et murs", quantite: 15, unite: UniteMesure.M2, prixUnitaire: 45, tauxTVA: 10, montantHT: 675 },
          { description: "Installation sanitaire", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 2500, tauxTVA: 20, montantHT: 2500 },
        ],
      },
    },
  });

  const devis2 = await prisma.devis.create({
    data: {
      numero: "DEV-2025-002",
      clientId: clients[1].id,
      montantHT: 12500,
      tva: 2500,
      montantTTC: 15000,
      statut: StatutDevis.ACCEPTE,
      dateValidite: new Date("2025-03-20"),
      notes: "Cuisine sur mesure",
      userId: user.id,
      lignes: {
        create: [
          { description: "Électricité cuisine", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 3500, tauxTVA: 20, montantHT: 3500 },
          { description: "Plomberie cuisine", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 2000, tauxTVA: 20, montantHT: 2000 },
          { description: "Pose carrelage", quantite: 20, unite: UniteMesure.M2, prixUnitaire: 50, tauxTVA: 10, montantHT: 1000 },
        ],
      },
    },
  });

  const facture1 = await prisma.facture.create({
    data: {
      numero: "FAC-2025-001",
      devisId: devis2.id,
      clientId: clients[1].id,
      montantHT: 12500,
      tva: 2500,
      montantTTC: 15000,
      statut: StatutFacture.PAYEE,
      dateEcheance: new Date("2025-02-28"),
      acompte: 4500,
      userId: user.id,
    },
  });
  await prisma.ligneFacture.createMany({
    data: [
      { description: "Acompte 30%", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 4500, tauxTVA: 20, montantHT: 3750, factureId: facture1.id },
      { description: "Solde", quantite: 1, unite: UniteMesure.FORFAIT, prixUnitaire: 10500, tauxTVA: 20, montantHT: 8750, factureId: facture1.id },
    ],
  });

  const facture2 = await prisma.facture.create({
    data: {
      numero: "FAC-2025-002",
      clientId: clients[0].id,
      montantHT: 5000,
      tva: 1000,
      montantTTC: 6000,
      statut: StatutFacture.ENVOYEE,
      dateEcheance: new Date("2025-03-10"),
      userId: user.id,
    },
  });
  await prisma.ligneFacture.create({
    data: {
      description: "Travaux divers",
      quantite: 1,
      unite: UniteMesure.FORFAIT,
      prixUnitaire: 5000,
      tauxTVA: 20,
      montantHT: 5000,
      factureId: facture2.id,
    },
  });

  console.log("Seed terminé : 1 user, 3 clients, 2 devis, 2 factures");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
