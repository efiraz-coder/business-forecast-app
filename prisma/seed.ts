import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create expense groups (system-wide)
  const expenseGroupNames = [
    { name: 'שיווק', type: 'variable' },
    { name: 'כ"א', type: 'fixed' },
    { name: 'הנהלה וכלליות', type: 'fixed' },
    { name: 'הוצאות ישירות', type: 'variable' },
    { name: 'מימון', type: 'fixed' },
    { name: 'בנק ועמלות אשראי', type: 'variable' },
  ]

  console.log('Creating expense groups...')
  const expenseGroups: Record<string, string> = {}
  
  for (const group of expenseGroupNames) {
    const created = await prisma.expenseGroup.upsert({
      where: { name: group.name },
      update: {},
      create: { name: group.name, type: group.type },
    })
    expenseGroups[group.name] = created.id
  }

  // Create demo advisor
  console.log('Creating demo advisor...')
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const advisor = await prisma.advisor.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'יועץ דמו',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  })

  // Create demo business - "המיזם של בן"
  console.log('Creating demo business...')
  const business = await prisma.business.create({
    data: {
      name: 'המיזם של בן',
      ownerName: 'בן כהן',
      advisors: {
        create: {
          advisorId: advisor.id,
          role: 'owner',
        },
      },
    },
  })

  // Create revenue channels with ROI data (מודל בן)
  console.log('Creating revenue channels with ROI...')
  const channelData = [
    { name: 'פייסבוק / אינסטגרם', marketingRoi: 3.2, conversionRate: 0.04, variableCostRate: 0.37 },
    { name: 'גוגל אדס', marketingRoi: 2.8, conversionRate: 0.06, variableCostRate: 0.37 },
    { name: 'הפניות', marketingRoi: 5.0, conversionRate: 0.15, variableCostRate: 0.30 },
  ]

  const channels = []
  for (const ch of channelData) {
    const channel = await prisma.revenueChannel.create({
      data: {
        businessId: business.id,
        name: ch.name,
        marketingRoi: ch.marketingRoi,
        conversionRate: ch.conversionRate,
        variableCostRate: ch.variableCostRate,
      },
    })
    channels.push(channel)
  }

  // Create expense items
  console.log('Creating expense items...')
  await prisma.expenseItem.createMany({
    data: [
      { businessId: business.id, expenseGroupId: expenseGroups['הנהלה וכלליות'], name: 'משרד ותשתיות', monthlyAmount: 3000 },
      { businessId: business.id, expenseGroupId: expenseGroups['הנהלה וכלליות'], name: 'תוכנות ומנויים', monthlyAmount: 1500 },
      { businessId: business.id, expenseGroupId: expenseGroups['מימון'], name: 'רו"ח', monthlyAmount: 1200 },
      { businessId: business.id, expenseGroupId: expenseGroups['מימון'], name: 'עו"ד', monthlyAmount: 500 },
    ],
  })

  // Create 12 months of drivers - מודל ROI של בן
  console.log('Creating drivers for 12 months (ROI model)...')
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  for (let i = 0; i < 12; i++) {
    const monthOffset = i
    let year = currentYear
    let month = currentMonth + monthOffset
    
    if (month > 12) {
      year += Math.floor((month - 1) / 12)
      month = ((month - 1) % 12) + 1
    }

    // Simulate growth over time
    const growthFactor = 1 + (i * 0.05) // 5% growth per month
    const seasonalFactor = 1 + 0.15 * Math.sin((month - 3) * Math.PI / 6)
    
    const baseMarketingBudget = 15000 * growthFactor * seasonalFactor

    await prisma.driver.create({
      data: {
        businessId: business.id,
        year,
        month,
        // New ROI model fields
        totalMarketingBudget: Math.round(baseMarketingBudget),
        fixedPayroll: 8000, // שכר קבוע
        adminExpenses: 3000, // הנהלה וכלליות
        operatingExpenses: 2500, // SEO, תוכנות, תפעול
        creditCardFeeRate: 0.02,
        personalLivingExpenses: 12000, // הוצאות מחיה
        otherIncome: i > 3 ? 2000 : 0, // הכנסות נוספות מחודש 4
        // Legacy fields (for backwards compatibility)
        expectedCustomers: Math.round(50 * growthFactor),
        avgRevenuePerCustomer: 900,
        marketingBudget: Math.round(baseMarketingBudget),
        headcount: 2,
        payrollTotal: 8000,
        notes: i === 0 ? 'חודש התחלה - מודל ROI' : undefined,
      },
    })
  }

  // Create a loan
  console.log('Creating loan...')
  const loanStartDate = new Date()
  const loanEndDate = new Date()
  loanEndDate.setFullYear(loanEndDate.getFullYear() + 2)

  await prisma.loan.create({
    data: {
      businessId: business.id,
      name: 'הלוואה להון חוזר',
      principal: 50000,
      interestRate: 0.08,
      startDate: loanStartDate,
      endDate: loanEndDate,
      paymentFrequency: 'monthly',
    },
  })

  // Create investments
  console.log('Creating investments...')
  await prisma.investment.create({
    data: {
      businessId: business.id,
      name: 'ציוד משרדי ומחשוב',
      amount: 20000,
      date: new Date(),
      depreciationPeriodMonths: 36,
    },
  })

  // Create 6 months of historical data
  console.log('Creating historical data...')
  for (let i = 6; i >= 1; i--) {
    let year = currentYear
    let month = currentMonth - i
    
    if (month <= 0) {
      year -= 1
      month += 12
    }

    const seasonalFactor = 1 + 0.15 * Math.sin((month - 3) * Math.PI / 6)
    const baseRevenue = 15000 * 3.0 * seasonalFactor // Marketing * avg ROI
    const randomVariation = 0.9 + Math.random() * 0.2

    await prisma.historicalActual.create({
      data: {
        businessId: business.id,
        year,
        month,
        revenueAmountTotal: Math.round(baseRevenue * randomVariation),
        profitLossTotal: Math.round(baseRevenue * randomVariation * 0.20),
        cashFlowTotal: Math.round(baseRevenue * randomVariation * 0.18),
      },
    })
  }

  console.log('Seed completed successfully!')
  console.log('')
  console.log('='.repeat(50))
  console.log('Demo user credentials:')
  console.log('Email: demo@example.com')
  console.log('Password: demo123')
  console.log('')
  console.log('Business: המיזם של בן')
  console.log('Model: ROI-based marketing (Ben\'s Venture)')
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
