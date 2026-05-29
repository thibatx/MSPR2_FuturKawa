/**
 * Jeu de données d'exemple pour la base Colombia.
 * Usage : npm run seed   (depuis apps/API_Colombia)
 */
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const expl = await prisma.exploitation.create({
    data: { nom: 'Finca El Paraíso (Huila)' },
  })

  const entrepot = await prisma.entrepot.create({
    data: { nom: 'Entrepôt Neiva', idExploitation: expl.id },
  })

  await prisma.lot.createMany({
    data: [
      { idEntrepot: entrepot.id, statut: 'EN_STOCK' },
      { idEntrepot: entrepot.id, statut: 'EXPEDIE' },
    ],
  })

  await prisma.mesure.createMany({
    data: [
      { idEntrepot: entrepot.id, temperature: 21.5, humidite: 55.0, statut: 'OK' },
      { idEntrepot: entrepot.id, temperature: 23.1, humidite: 60.2, statut: 'ALERTE' },
    ],
  })

  console.log('✅ Seed Colombia terminé')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
