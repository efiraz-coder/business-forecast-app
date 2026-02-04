/**
 * מנוע חיזוי כלכלי מבוסס דרייברים
 * 
 * מחשב תחזית ל-12 חודשים קדימה על בסיס:
 * - מכירות צפויות לכל מוצר
 * - עלויות כ"א
 * - הוצאות שיווק
 * - הוצאות קבועות
 * - הוצאות מימון
 */

import { prisma } from './prisma'

// Types
export interface ForecastInput {
  businessId: string
  // What-If multipliers (optional)
  salesMultiplier?: number
  priceMultiplier?: number
  marketingMultiplier?: number
  headcountAdjustment?: number
  rentMultiplier?: number
}

export interface MonthlyForecast {
  month: number
  monthName: string
  // הכנסות
  revenue: number
  revenueByProduct: { productId: string; name: string; units: number; revenue: number }[]
  // עלויות ישירות
  cogs: number
  purchases: number
  grossProfit: number
  grossMargin: number
  // הוצאות תפעוליות
  payroll: number
  payrollByRole: { roleId: string; name: string; headcount: number; cost: number }[]
  marketing: number
  marketingByChannel: { channel: string; amount: number }[]
  admin: number
  // הוצאות מימון
  finance: number
  financeBreakdown: { type: string; amount: number }[]
  // תוצאות
  operatingProfit: number
  netProfit: number
  netMargin: number
  // תזרים
  cashFlow: number
  bankBalance: number
  // מלאי
  inventoryValue: number
}

// Hebrew month names
const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

/**
 * חישוב התחזית המלאה ל-12 חודשים
 */
export async function calculateForecast(input: ForecastInput): Promise<MonthlyForecast[]> {
  const {
    businessId,
    salesMultiplier = 1,
    priceMultiplier = 1,
    marketingMultiplier = 1,
    headcountAdjustment = 0,
    rentMultiplier = 1,
  } = input

  // Fetch all data
  const [business, products, headcountRoles, fixedExpenses, marketingBudgets, financingItems] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.product.findMany({
      where: { businessId, isActive: true },
      include: { salesForecast: true },
    }),
    prisma.headcountRole.findMany({
      where: { businessId, isActive: true },
      include: { headcountForecast: true },
    }),
    prisma.fixedExpense.findMany({
      where: { businessId, isEnabled: true },
      include: { monthlyOverride: true },
    }),
    prisma.marketingBudget.findMany({ where: { businessId } }),
    prisma.financingItem.findMany({ where: { businessId } }),
  ])

  if (!business) throw new Error('Business not found')

  const results: MonthlyForecast[] = []
  let bankBalance = business.openingBalance || 0
  const inventoryState: Record<string, number> = {} // Track inventory per product

  // Initialize inventory
  products.forEach(p => {
    if (p.hasInventory && p.inventoryOpen) {
      inventoryState[p.id] = p.inventoryOpen
    }
  })

  for (let month = 1; month <= 12; month++) {
    // ===== 1. הכנסות =====
    const revenueByProduct: MonthlyForecast['revenueByProduct'] = []
    let totalRevenue = 0
    let totalCogs = 0
    let totalPurchases = 0

    for (const product of products) {
      const forecast = product.salesForecast.find(f => f.month === month)
      const units = (forecast?.units || 0) * salesMultiplier
      const price = product.price * priceMultiplier
      const revenue = units * price

      revenueByProduct.push({
        productId: product.id,
        name: product.name,
        units,
        revenue,
      })
      totalRevenue += revenue

      // ===== 2. עלות ישירה (COGS) =====
      if (product.hasInventory && product.costPerUnit) {
        // Physical product with inventory
        const cogs = units * product.costPerUnit
        totalCogs += cogs

        // Calculate inventory purchases
        const currentInventory = inventoryState[product.id] || 0
        const afterSales = currentInventory - units
        const minInventory = product.minInventory || 0

        if (afterSales < minInventory) {
          // Need to purchase more inventory
          const purchaseUnits = minInventory - afterSales + units // Buy enough for next month
          const purchaseCost = purchaseUnits * product.costPerUnit
          totalPurchases += purchaseCost
          inventoryState[product.id] = minInventory + units
        } else {
          inventoryState[product.id] = afterSales
        }
      } else {
        // Service or digital - variable cost as percentage
        const variableCost = revenue * (product.variableCostRate || 0.3)
        totalCogs += variableCost
      }
    }

    const grossProfit = totalRevenue - totalCogs
    const grossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0

    // ===== 3. כ"א =====
    const payrollByRole: MonthlyForecast['payrollByRole'] = []
    let totalPayroll = 0

    for (const role of headcountRoles) {
      // Calculate cumulative headcount changes up to this month
      let headcount = role.headcount
      let salary = role.avgSalary

      for (const forecast of role.headcountForecast.filter(f => f.month <= month)) {
        headcount += forecast.headcountChange
        if (forecast.salaryChange > 0) {
          salary = salary * (1 + forecast.salaryChange)
        }
      }

      // Apply What-If adjustment
      headcount = Math.max(0, headcount + headcountAdjustment)

      const cost = headcount * salary * (1 + role.employerCostRate)

      payrollByRole.push({
        roleId: role.id,
        name: role.name,
        headcount,
        cost,
      })
      totalPayroll += cost
    }

    // ===== 4. שיווק =====
    const marketingByChannel: MonthlyForecast['marketingByChannel'] = []
    let totalMarketing = 0

    const monthlyMarketing = marketingBudgets.find(m => m.month === month)
    if (monthlyMarketing) {
      const budget = monthlyMarketing.totalBudget * marketingMultiplier

      if (monthlyMarketing.googlePercent > 0) {
        const amount = budget * (monthlyMarketing.googlePercent / 100)
        marketingByChannel.push({ channel: 'Google Ads', amount })
        totalMarketing += amount
      }
      if (monthlyMarketing.facebookPercent > 0) {
        const amount = budget * (monthlyMarketing.facebookPercent / 100)
        marketingByChannel.push({ channel: 'Facebook/Instagram', amount })
        totalMarketing += amount
      }
      if (monthlyMarketing.seoPercent > 0) {
        const amount = budget * (monthlyMarketing.seoPercent / 100)
        marketingByChannel.push({ channel: 'SEO', amount })
        totalMarketing += amount
      }
      if (monthlyMarketing.otherPercent > 0) {
        const amount = budget * (monthlyMarketing.otherPercent / 100)
        marketingByChannel.push({ channel: 'אחר', amount })
        totalMarketing += amount
      }

      // Agency fees
      if (monthlyMarketing.hasAgency) {
        const agencyFee = monthlyMarketing.agencyFixedFee + 
          (budget * (monthlyMarketing.agencyPercentFee / 100))
        marketingByChannel.push({ channel: 'סוכנות', amount: agencyFee })
        totalMarketing += agencyFee
      }
    }

    // ===== 5. הנהלה וכלליות =====
    let totalAdmin = 0

    for (const expense of fixedExpenses) {
      // Check for monthly override
      const override = expense.monthlyOverride.find(o => o.month === month)
      let amount = override ? override.amount : expense.monthlyAmount

      // Apply rent multiplier if this is rent
      if (expense.name.includes('שכירות')) {
        amount *= rentMultiplier
      }

      totalAdmin += amount
    }

    // ===== 6. מימון =====
    const financeBreakdown: MonthlyForecast['financeBreakdown'] = []
    let totalFinance = 0

    for (const item of financingItems) {
      let amount = 0

      switch (item.type) {
        case 'bank_fees':
        case 'overdraft_interest':
          amount = item.monthlyAmount || 0
          break

        case 'cc_fee_rate':
          // Credit card fees as percentage of revenue
          amount = totalRevenue * (item.percentRate || 0)
          break

        case 'loan':
          // Calculate loan payment if active in this month
          if (item.principal && item.interestRate && item.termMonths && item.startMonth) {
            if (month >= item.startMonth && month < item.startMonth + item.termMonths) {
              // Simple loan payment calculation (principal + interest / months)
              const monthlyPrincipal = item.principal / item.termMonths
              const monthlyInterest = (item.principal * item.interestRate) / 12
              amount = monthlyPrincipal + monthlyInterest
            }
          }
          break
      }

      if (amount > 0) {
        financeBreakdown.push({ type: item.name, amount })
        totalFinance += amount
      }
    }

    // ===== 7. תוצאות =====
    const operatingProfit = grossProfit - totalPayroll - totalMarketing - totalAdmin
    const netProfit = operatingProfit - totalFinance
    const netMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0

    // ===== 8. תזרים =====
    // Cash flow = Net profit - inventory purchases (inventory is a cash outflow)
    const cashFlow = netProfit - totalPurchases
    bankBalance += cashFlow

    // Calculate inventory value
    let inventoryValue = 0
    for (const product of products) {
      if (product.hasInventory && product.costPerUnit) {
        inventoryValue += (inventoryState[product.id] || 0) * product.costPerUnit
      }
    }

    results.push({
      month,
      monthName: HEBREW_MONTHS[month - 1],
      revenue: Math.round(totalRevenue),
      revenueByProduct,
      cogs: Math.round(totalCogs),
      purchases: Math.round(totalPurchases),
      grossProfit: Math.round(grossProfit),
      grossMargin: Math.round(grossMargin * 100) / 100,
      payroll: Math.round(totalPayroll),
      payrollByRole,
      marketing: Math.round(totalMarketing),
      marketingByChannel,
      admin: Math.round(totalAdmin),
      finance: Math.round(totalFinance),
      financeBreakdown,
      operatingProfit: Math.round(operatingProfit),
      netProfit: Math.round(netProfit),
      netMargin: Math.round(netMargin * 100) / 100,
      cashFlow: Math.round(cashFlow),
      bankBalance: Math.round(bankBalance),
      inventoryValue: Math.round(inventoryValue),
    })
  }

  return results
}

/**
 * חישוב KPIs שנתיים
 */
export function calculateAnnualKPIs(forecast: MonthlyForecast[]) {
  const totalRevenue = forecast.reduce((sum, m) => sum + m.revenue, 0)
  const totalProfit = forecast.reduce((sum, m) => sum + m.netProfit, 0)
  const totalCashFlow = forecast.reduce((sum, m) => sum + m.cashFlow, 0)
  const avgMonthlyRevenue = totalRevenue / 12
  const avgMonthlyProfit = totalProfit / 12
  const avgMonthlyMargin = forecast.reduce((sum, m) => sum + m.netMargin, 0) / 12

  // Find break-even month (first month with positive cumulative profit)
  let cumulativeProfit = 0
  let breakEvenMonth = null
  for (const month of forecast) {
    cumulativeProfit += month.netProfit
    if (cumulativeProfit > 0 && breakEvenMonth === null) {
      breakEvenMonth = month.month
    }
  }

  // Calculate lowest bank balance
  const lowestBalance = Math.min(...forecast.map(m => m.bankBalance))
  const lowestBalanceMonth = forecast.find(m => m.bankBalance === lowestBalance)?.month || 0

  return {
    totalRevenue,
    totalProfit,
    totalCashFlow,
    avgMonthlyRevenue,
    avgMonthlyProfit,
    avgMonthlyMargin,
    breakEvenMonth,
    endingBankBalance: forecast[11]?.bankBalance || 0,
    lowestBalance,
    lowestBalanceMonth,
    profitMargin: totalRevenue > 0 ? totalProfit / totalRevenue : 0,
  }
}

/**
 * שמירת תוצאות התחזית ב-DB
 */
export async function saveForecastResults(businessId: string, forecast: MonthlyForecast[]) {
  // Delete existing results
  await prisma.forecastResult.deleteMany({ where: { businessId } })

  // Insert new results
  await prisma.forecastResult.createMany({
    data: forecast.map(m => ({
      businessId,
      month: m.month,
      revenue: m.revenue,
      cogs: m.cogs,
      purchases: m.purchases,
      grossProfit: m.grossProfit,
      payroll: m.payroll,
      marketing: m.marketing,
      admin: m.admin,
      finance: m.finance,
      operatingProfit: m.operatingProfit,
      netProfit: m.netProfit,
      cashFlow: m.cashFlow,
      bankBalance: m.bankBalance,
    })),
  })
}
