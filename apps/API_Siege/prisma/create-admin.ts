/**
 * Script de bootstrap : crée (ou met à jour) un compte admin.
 *
 * Usage :
 *   npm run create:admin -- <email> <password> [name]
 */
import * as bcrypt from 'bcrypt'
import { PrismaClient } from '../src/generated/prisma'

async function main() {
  const [, , email, password, name] = process.argv
  if (!email || !password) {
    console.error('Usage: npm run create:admin -- <email> <password> [name]')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('Le mot de passe doit faire au moins 8 caractères.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: 'ADMIN', name: name ?? undefined },
      create: { email, passwordHash, role: 'ADMIN', name: name ?? null },
    })
    console.log(`✅ Admin prêt : ${admin.email} (id: ${admin.id})`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
