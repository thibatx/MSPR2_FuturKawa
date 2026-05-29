/**
 * Jeu de données d'exemple pour la base Brazil.
 * Usage : npm run seed   (depuis apps/API_Brazil)
 */
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const expl = await prisma.exploitation.create({
    data: { nom: 'Fazenda Santa Clara (Minas Gerais)' },
  })

  const entrepot = await prisma.entrepot.create({
    data: { nom: 'Armazém Varginha', idExploitation: expl.id },
  })

  await prisma.lot.createMany({
    data: [
      { idEntrepot: entrepot.id, statut: 'EN_STOCK' },
      { idEntrepot: entrepot.id, statut: 'EN_STOCK' },
      { idEntrepot: entrepot.id, statut: 'EXPEDIE' },
    ],
  })

  await prisma.mesure.createMany({
    data: [
      { idEntrepot: entrepot.id, temperature: 24.0, humidite: 58.0, statut: 'OK' },
      { idEntrepot: entrepot.id, temperature: 26.4, humidite: 65.8, statut: 'ALERTE' },
    ],
  })

  console.log('✅ Seed Brazil terminé')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
