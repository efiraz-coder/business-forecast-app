import { prisma } from './prisma'
import { ForecastResult, WhatIfParams, ChannelBreakdown, HEBREW_MONTHS } from '@/types'
import { 
  getCurrentYearMonth, 
  addMonths, 
  calculateMonthlyLoanPayment, 
  calculateMonthlyDepreciation 
} from './utils'

/**
 * מודל החיזוי של "המיזם של בן"
 * 
 * נוסחאות עיקריות:
 * 1. הכנסה לפי ערוץ = תקציב_שיווק × ROI
 * 2. עלות משתנה (כ"א) = הכנסה × אחוז_עלות_משתנה (למשל 37%)
 * 3. רווח גולמי = הכנסה - עלות_משתנה
 * 4. רווח תפעולי = רווח_גולמי - הוצאות_תפעול - הוצאות_קבועות
 * 5. רווח נקי = רווח_תפעולי - הוצאות_מימון
 * 6. יתרה לחיסכון = רווח_נקי + הכנסות_נוספות - הוצאות_מחיה
 */

interface DriverData {
  id: string
  year: number
  month: number
  totalMarketingBudget: number
  fixedPayroll: number
  adminExpenses: number
  operatingExpenses: number
  creditCardFeeRate: number
  personalLivingExpenses: number
  otherIncome: number
  // Legacy fields
  expectedCustomers: number
  avgRevenuePerCustomer: number
  marketingBudget: number
  payrollTotal: number
}

interface ChannelDriverData {
  revenueChannelId: string
  marketingBudget: number
  roiOverride: number | null
}

interface ChannelData {
  id: string
  name: string
  marketingRoi: number
  conversionRate: number
  variableCostRate: number
}

interface LoanData {
  principal: number
  interestRate: number
  startDate: Date
  endDate: Date
}

interface InvestmentData {
  amount: number
  date: Date
  depreciationPeriodMonths: number
}

interface HistoricalData {
  year: number
  month: number
  revenueAmountTotal: number
  profitLossTotal: number
}

/**
 * Main forecast function - מודל ROI של בן
 */
export async function getForecastForBusiness(
  businessId: string,
  monthsAhead: number = 12,
  openingBalance: number = 0
): Promise<ForecastResult[]> {
  // Fetch all required data
  const [drivers, channels, loans, investments, historicalActuals, expenseItems] = await Promise.all([
    prisma.driver.findMany({
      where: { businessId },
      include: {
        channelDrivers: true,
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    }),
    prisma.revenueChannel.findMany({
      where: { businessId, isActive: true },
    }),
    prisma.loan.findMany({
      where: { businessId },
    }),
    prisma.investment.findMany({
      where: { businessId },
    }),
    prisma.historicalActual.findMany({
      where: { businessId },
    }),
    prisma.expenseItem.findMany({
      where: { businessId, isActive: true },
    }),
  ])

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const results: ForecastResult[] = []
  let bankBalance = openingBalance

  // Calculate additional fixed expenses from expense items
  const additionalFixedExpenses = expenseItems
    .filter(item => !item.isPercentOfRevenue)
    .reduce((sum, item) => sum + item.monthlyAmount, 0)

  for (let i = 0; i < monthsAhead; i++) {
    const { year, month } = addMonths(currentYear, currentMonth, i)
    
    // Find driver for this month
    const driver = findDriverForMonth(drivers, year, month)
    const channelDrivers = driver?.channelDrivers || []
    
    // Calculate revenue per channel (ROI model)
    const channelBreakdown = calculateChannelRevenue(channels, channelDrivers, driver)
    const totalRevenue = channelBreakdown.reduce((sum, ch) => sum + ch.revenue, 0)
    
    // Calculate variable costs (כ"א תלוי הכנסה)
    const variableCosts = channelBreakdown.reduce((sum, ch) => sum + ch.variableCosts, 0)
    
    // Gross profit
    const grossProfit = totalRevenue - variableCosts
    
    // Marketing expenses (סה"כ תקציב שיווק)
    const marketingExpenses = channelBreakdown.reduce((sum, ch) => sum + ch.marketingBudget, 0)
    
    // Fixed costs
    const fixedCosts = (driver?.fixedPayroll || 0) + 
                       (driver?.adminExpenses || 0) + 
                       additionalFixedExpenses
    
    // Operating expenses
    const operatingExpenses = driver?.operatingExpenses || 0
    
    // Credit card fees
    const creditCardFees = totalRevenue * (driver?.creditCardFeeRate || 0)
    
    // Financial expenses (loans + depreciation)
    const loanPayments = calculateTotalLoanPayments(loans, year, month)
    const depreciation = calculateTotalDepreciation(investments, year, month)
    const financialExpenses = loanPayments + depreciation
    
    // Total expenses
    const totalExpenses = variableCosts + marketingExpenses + fixedCosts + 
                          operatingExpenses + creditCardFees + financialExpenses
    
    // Operating profit
    const operatingProfit = grossProfit - marketingExpenses - fixedCosts - operatingExpenses - creditCardFees
    
    // Net profit/loss
    const profitLoss = totalRevenue - totalExpenses
    
    // Ben's Model: Net Savings (יתרה לחיסכון)
    const otherIncome = driver?.otherIncome || 0
    const personalLivingExpenses = driver?.personalLivingExpenses || 0
    const netSavings = profitLoss + otherIncome - personalLivingExpenses
    
    // Cash flow
    const cashFlow = profitLoss
    bankBalance += cashFlow
    
    // Get historical data for comparison
    const historical = findHistoricalData(historicalActuals, year, month)
    const deltas = calculateDeltas(totalRevenue, profitLoss, historical)
    
    // Determine traffic light
    const trafficLight = determineTrafficLight(profitLoss, netSavings, totalRevenue, results)
    
    results.push({
      year,
      month,
      monthName: HEBREW_MONTHS[month - 1],
      totalRevenueForecast: Math.round(totalRevenue),
      channelBreakdown,
      totalExpensesForecast: Math.round(totalExpenses),
      variableCosts: Math.round(variableCosts),
      fixedCosts: Math.round(fixedCosts),
      operatingExpenses: Math.round(operatingExpenses),
      marketingExpenses: Math.round(marketingExpenses),
      financialExpenses: Math.round(financialExpenses),
      grossProfit: Math.round(grossProfit),
      operatingProfit: Math.round(operatingProfit),
      profitLossForecast: Math.round(profitLoss),
      otherIncome: Math.round(otherIncome),
      personalLivingExpenses: Math.round(personalLivingExpenses),
      netSavings: Math.round(netSavings),
      cashFlowForecast: Math.round(cashFlow),
      bankBalanceForecast: Math.round(bankBalance),
      actualRevenue: historical?.revenueAmountTotal,
      actualProfitLoss: historical?.profitLossTotal,
      revenueDeltaPercent: deltas.revenueDelta,
      profitDeltaPercent: deltas.profitDelta,
      trafficLight: trafficLight.status,
      trafficLightReason: trafficLight.reason,
    })
  }
  
  return results
}

/**
 * What-if scenario forecast with ROI multipliers
 */
export async function getWhatIfForecast(params: WhatIfParams): Promise<ForecastResult[]> {
  const {
    businessId,
    monthsAhead = 12,
    openingBalance = 0,
    marketingBudgetMultiplier = 1,
    channelRoiOverrides = [],
    variableCostRateAdjustment = 0,
    fixedCostsMultiplier = 1,
  } = params

  // Fetch all required data
  const [drivers, channels, loans, investments, historicalActuals, expenseItems] = await Promise.all([
    prisma.driver.findMany({
      where: { businessId },
      include: { channelDrivers: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    }),
    prisma.revenueChannel.findMany({
      where: { businessId, isActive: true },
    }),
    prisma.loan.findMany({ where: { businessId } }),
    prisma.investment.findMany({ where: { businessId } }),
    prisma.historicalActual.findMany({ where: { businessId } }),
    prisma.expenseItem.findMany({ where: { businessId, isActive: true } }),
  ])

  // Apply ROI overrides to channels
  const modifiedChannels = channels.map(ch => {
    const override = channelRoiOverrides.find(o => o.channelId === ch.id)
    return {
      ...ch,
      marketingRoi: ch.marketingRoi * (override?.roiMultiplier || 1),
      variableCostRate: Math.max(0, Math.min(1, ch.variableCostRate + variableCostRateAdjustment)),
    }
  })

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const results: ForecastResult[] = []
  let bankBalance = openingBalance

  const additionalFixedExpenses = expenseItems
    .filter(item => !item.isPercentOfRevenue)
    .reduce((sum, item) => sum + item.monthlyAmount, 0) * fixedCostsMultiplier

  for (let i = 0; i < monthsAhead; i++) {
    const { year, month } = addMonths(currentYear, currentMonth, i)
    
    const driver = findDriverForMonth(drivers, year, month)
    
    // Apply marketing budget multiplier to channel drivers
    const modifiedChannelDrivers = (driver?.channelDrivers || []).map(cd => ({
      ...cd,
      marketingBudget: cd.marketingBudget * marketingBudgetMultiplier,
    }))
    
    const channelBreakdown = calculateChannelRevenue(modifiedChannels, modifiedChannelDrivers, driver)
    const totalRevenue = channelBreakdown.reduce((sum, ch) => sum + ch.revenue, 0)
    const variableCosts = channelBreakdown.reduce((sum, ch) => sum + ch.variableCosts, 0)
    const grossProfit = totalRevenue - variableCosts
    const marketingExpenses = channelBreakdown.reduce((sum, ch) => sum + ch.marketingBudget, 0)
    
    const fixedCosts = ((driver?.fixedPayroll || 0) + 
                        (driver?.adminExpenses || 0)) * fixedCostsMultiplier + 
                       additionalFixedExpenses
    
    const operatingExpenses = (driver?.operatingExpenses || 0) * fixedCostsMultiplier
    const creditCardFees = totalRevenue * (driver?.creditCardFeeRate || 0)
    const loanPayments = calculateTotalLoanPayments(loans, year, month)
    const depreciation = calculateTotalDepreciation(investments, year, month)
    const financialExpenses = loanPayments + depreciation
    
    const totalExpenses = variableCosts + marketingExpenses + fixedCosts + 
                          operatingExpenses + creditCardFees + financialExpenses
    
    const operatingProfit = grossProfit - marketingExpenses - fixedCosts - operatingExpenses - creditCardFees
    const profitLoss = totalRevenue - totalExpenses
    
    const otherIncome = driver?.otherIncome || 0
    const personalLivingExpenses = driver?.personalLivingExpenses || 0
    const netSavings = profitLoss + otherIncome - personalLivingExpenses
    
    const cashFlow = profitLoss
    bankBalance += cashFlow
    
    const historical = findHistoricalData(historicalActuals, year, month)
    const deltas = calculateDeltas(totalRevenue, profitLoss, historical)
    const trafficLight = determineTrafficLight(profitLoss, netSavings, totalRevenue, results)
    
    results.push({
      year,
      month,
      monthName: HEBREW_MONTHS[month - 1],
      totalRevenueForecast: Math.round(totalRevenue),
      channelBreakdown,
      totalExpensesForecast: Math.round(totalExpenses),
      variableCosts: Math.round(variableCosts),
      fixedCosts: Math.round(fixedCosts),
      operatingExpenses: Math.round(operatingExpenses),
      marketingExpenses: Math.round(marketingExpenses),
      financialExpenses: Math.round(financialExpenses),
      grossProfit: Math.round(grossProfit),
      operatingProfit: Math.round(operatingProfit),
      profitLossForecast: Math.round(profitLoss),
      otherIncome: Math.round(otherIncome),
      personalLivingExpenses: Math.round(personalLivingExpenses),
      netSavings: Math.round(netSavings),
      cashFlowForecast: Math.round(cashFlow),
      bankBalanceForecast: Math.round(bankBalance),
      actualRevenue: historical?.revenueAmountTotal,
      actualProfitLoss: historical?.profitLossTotal,
      revenueDeltaPercent: deltas.revenueDelta,
      profitDeltaPercent: deltas.profitDelta,
      trafficLight: trafficLight.status,
      trafficLightReason: trafficLight.reason,
    })
  }
  
  return results
}

/**
 * Calculate revenue per channel based on ROI model
 * הכנסה = תקציב_שיווק × ROI
 */
function calculateChannelRevenue(
  channels: ChannelData[],
  channelDrivers: ChannelDriverData[],
  driver: DriverData | null
): ChannelBreakdown[] {
  return channels.map(channel => {
    const channelDriver = channelDrivers.find(cd => cd.revenueChannelId === channel.id)
    
    // Get marketing budget for this channel
    let marketingBudget = channelDriver?.marketingBudget || 0
    
    // If no channel-specific budget, distribute total budget equally
    if (marketingBudget === 0 && driver?.totalMarketingBudget) {
      marketingBudget = driver.totalMarketingBudget / channels.length
    }
    
    // Legacy fallback
    if (marketingBudget === 0 && driver?.marketingBudget) {
      marketingBudget = driver.marketingBudget / channels.length
    }
    
    // Get ROI (channel driver override or channel default)
    const roi = channelDriver?.roiOverride || channel.marketingRoi
    
    // Calculate revenue: Budget × ROI
    const revenue = marketingBudget * roi
    
    // Calculate variable costs (e.g., 37% of revenue for HR)
    const variableCosts = revenue * channel.variableCostRate
    
    // Gross profit per channel
    const grossProfit = revenue - variableCosts
    
    return {
      channelId: channel.id,
      channelName: channel.name,
      marketingBudget: Math.round(marketingBudget),
      roi,
      revenue: Math.round(revenue),
      variableCosts: Math.round(variableCosts),
      grossProfit: Math.round(grossProfit),
    }
  })
}

/**
 * Find the most relevant driver for a given month
 */
function findDriverForMonth(
  drivers: (DriverData & { channelDrivers: ChannelDriverData[] })[],
  year: number,
  month: number
): (DriverData & { channelDrivers: ChannelDriverData[] }) | null {
  // Exact match
  const exact = drivers.find((d) => d.year === year && d.month === month)
  if (exact) return exact
  
  // Find the most recent driver before this date
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
  
  for (const driver of sortedDrivers) {
    if (driver.year < year || (driver.year === year && driver.month <= month)) {
      return driver
    }
  }
  
  return null
}

/**
 * Calculate total loan payments for a given month
 */
function calculateTotalLoanPayments(
  loans: LoanData[],
  year: number,
  month: number
): number {
  const currentDate = new Date(year, month - 1, 15)
  
  return loans.reduce((total, loan) => {
    if (currentDate < loan.startDate || currentDate > loan.endDate) {
      return total
    }
    
    const loanMonths = Math.ceil(
      (loan.endDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    
    const monthlyPayment = calculateMonthlyLoanPayment(
      loan.principal,
      loan.interestRate,
      loanMonths
    )
    
    return total + monthlyPayment
  }, 0)
}

/**
 * Calculate total depreciation for a given month
 */
function calculateTotalDepreciation(
  investments: InvestmentData[],
  year: number,
  month: number
): number {
  const currentDate = new Date(year, month - 1, 15)
  
  return investments.reduce((total, inv) => {
    if (inv.depreciationPeriodMonths <= 0) return total
    
    const investmentDate = new Date(inv.date)
    const endDate = new Date(inv.date)
    endDate.setMonth(endDate.getMonth() + inv.depreciationPeriodMonths)
    
    if (currentDate < investmentDate || currentDate > endDate) {
      return total
    }
    
    const monthlyDepreciation = calculateMonthlyDepreciation(
      inv.amount,
      inv.depreciationPeriodMonths
    )
    
    return total + monthlyDepreciation
  }, 0)
}

/**
 * Find historical data for a given month
 */
function findHistoricalData(
  historicals: HistoricalData[],
  year: number,
  month: number
): HistoricalData | undefined {
  return historicals.find((h) => h.year === year && h.month === month)
}

/**
 * Calculate delta percentages
 */
function calculateDeltas(
  forecastRevenue: number,
  forecastProfit: number,
  historical?: HistoricalData
): { revenueDelta?: number; profitDelta?: number } {
  if (!historical) return {}
  
  const revenueDelta = historical.revenueAmountTotal !== 0
    ? (forecastRevenue - historical.revenueAmountTotal) / historical.revenueAmountTotal
    : undefined
    
  const profitDelta = historical.profitLossTotal !== 0
    ? (forecastProfit - historical.profitLossTotal) / Math.abs(historical.profitLossTotal)
    : undefined
  
  return { revenueDelta, profitDelta }
}

/**
 * Determine traffic light status - מודל בן
 * מתחשב גם ביתרה לחיסכון
 */
function determineTrafficLight(
  profitLoss: number,
  netSavings: number,
  revenue: number,
  previousResults: ForecastResult[]
): { status: 'green' | 'yellow' | 'red'; reason: string } {
  const profitMargin = revenue > 0 ? profitLoss / revenue : 0
  
  // Count negative months
  const recentNegativeProfits = previousResults
    .slice(-3)
    .filter((r) => r.profitLossForecast < 0).length
    
  const recentNegativeSavings = previousResults
    .slice(-3)
    .filter((r) => r.netSavings < 0).length
  
  // Red: Significant losses or negative savings
  if (profitMargin < -0.1 || recentNegativeProfits >= 2 || netSavings < -10000) {
    return {
      status: 'red',
      reason: `אזהרה - ${netSavings < 0 ? 'יתרה לחיסכון שלילית' : 'הפסדים מצטברים'}. נדרשת התערבות.`,
    }
  }
  
  // Yellow: Low profitability or break-even savings
  if (profitMargin < 0.05 || netSavings < 0 || recentNegativeSavings >= 1) {
    return {
      status: 'yellow',
      reason: `תשומת לב - ${netSavings < 5000 ? 'יתרה לחיסכון נמוכה' : 'רווחיות נמוכה'}. מומלץ לבחון שיפורים.`,
    }
  }
  
  // Green: Healthy
  return {
    status: 'green',
    reason: `מצב תקין - רווחיות ${Math.round(profitMargin * 100)}%, יתרה לחיסכון ${netSavings.toLocaleString('he-IL')} ₪.`,
  }
}
