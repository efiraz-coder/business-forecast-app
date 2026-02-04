import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin credentials - customized
  const adminUsername = 'efiraz'
  const adminPassword = 'dolu3530R$'
  
  // Hash passwords
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const hashedAnswer1 = await bcrypt.hash('admin', 12)
  const hashedAnswer2 = await bcrypt.hash('admin', 12)

  // Delete existing admin if exists
  await prisma.user.deleteMany({
    where: { role: 'admin' }
  })

  // Create admin user
  const admin = await prisma.user.create({
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

  console.log('')
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║           🔐 Admin User Created Successfully           ║')
  console.log('╠════════════════════════════════════════════════════════╣')
  console.log('║                                                        ║')
  console.log(`║   שם משתמש:  ${adminUsername}                                   ║`)
  console.log(`║   סיסמה:     ${adminPassword}                            ║`)
  console.log('║                                                        ║')
  console.log('║   ⚠️  מנהל לא צריך לענות על שאלות ביטחון               ║')
  console.log('║                                                        ║')
  console.log('║   בכניסה הראשונה, תתבקש להזין כתובת מייל לשחזור       ║')
  console.log('║                                                        ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
