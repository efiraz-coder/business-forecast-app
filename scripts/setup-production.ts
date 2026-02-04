/**
 * Production Setup Script
 * Run this after deploying to create the admin user
 * 
 * Usage: npx tsx scripts/setup-production.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up production database...')
  console.log('')

  // Check if admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!')
    console.log(`   Username: ${existingAdmin.username}`)
    console.log('')
    console.log('If you need to reset the admin, delete the user first.')
    return
  }

  // Create admin
  const adminUsername = 'efiraz'
  const adminPassword = 'dolu3530R$'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const hashedAnswer1 = await bcrypt.hash('admin', 12)
  const hashedAnswer2 = await bcrypt.hash('admin', 12)

  await prisma.user.create({
    data: {
      username: adminUsername,
      password: hashedPassword,
      businessName: 'מנהל מערכת',
      role: 'admin',
      securityQuestion1: 'מה שם בית הספר היסודי שלך?',
      securityAnswer1: hashedAnswer1,
      securityQuestion2: 'מה שם חיית המחמד שלך?',
      securityAnswer2: hashedAnswer2,
      isEmailVerified: false,
    },
  })

  console.log('✅ Admin user created successfully!')
  console.log('')
  console.log('╔════════════════════════════════════════╗')
  console.log('║   Login Credentials                    ║')
  console.log('╠════════════════════════════════════════╣')
  console.log(`║   Username: ${adminUsername}                    ║`)
  console.log(`║   Password: ${adminPassword}               ║`)
  console.log('╚════════════════════════════════════════╝')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
