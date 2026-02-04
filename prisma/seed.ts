// This file is not used in production - see seed-admin.ts for admin creation
// Keeping as placeholder for potential future seeding needs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed completed - no data to seed')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
