// Forecast Types - מודל ROI של בן
export interface ChannelBreakdown {
  channelId: string
  channelName: string
  marketingBudget: number      // תקציב שיווק
  roi: number                  // יחס החזר שיווקי
  revenue: number              // הכנסה מהערוץ
  variableCosts: number        // עלויות משתנות (כ"א)
  grossProfit: number          // רווח גולמי
}

export interface ForecastResult {
  year: number
  month: number
  monthName: string
  // הכנסות
  totalRevenueForecast: number
  channelBreakdown: ChannelBreakdown[]  // פירוט לפי ערוצים
  // הוצאות
  totalExpensesForecast: number
  variableCosts: number                 // עלויות משתנות (כ"א תלוי הכנסה)
  fixedCosts: number                    // עלויות קבועות
  operatingExpenses: number             // הוצאות תפעול
  marketingExpenses: number             // הוצאות שיווק
  financialExpenses: number             // הוצאות מימון (הלוואות + פחת)
  // רווחיות
  grossProfit: number                   // רווח גולמי
  operatingProfit: number               // רווח תפעולי
  profitLossForecast: number            // רווח/הפסד נקי
  // מודל בן - יתרה לחיסכון
  otherIncome: number                   // הכנסות נוספות
  personalLivingExpenses: number        // הוצאות מחיה
  netSavings: number                    // יתרה לחיסכון
  // תזרים
  cashFlowForecast: number
  bankBalanceForecast: number
  // השוואה להיסטוריה
  actualRevenue?: number
  actualProfitLoss?: number
  revenueDeltaPercent?: number
  profitDeltaPercent?: number
  // רמזור
  trafficLight: 'green' | 'yellow' | 'red'
  trafficLightReason: string
}

export interface ForecastParams {
  businessId: string
  monthsAhead: number
  openingBalance?: number
}

export interface WhatIfParams extends ForecastParams {
  // מודל ROI חדש
  marketingBudgetMultiplier?: number    // מכפיל תקציב שיווק כללי
  channelRoiOverrides?: {               // דריסת ROI לפי ערוץ
    channelId: string
    roiMultiplier: number
  }[]
  variableCostRateAdjustment?: number   // שינוי באחוז עלות משתנה
  fixedCostsMultiplier?: number         // מכפיל עלויות קבועות
  // תאימות אחורה
  customerMultiplier?: number
  revenueMultiplier?: number
  marketingMultiplier?: number
  headcountAdjustment?: number
}

// ממשק לערוץ מכירה עם ROI
export interface RevenueChannelWithROI {
  id: string
  name: string
  isActive: boolean
  marketingRoi: number
  conversionRate: number
  variableCostRate: number
}

// ממשק לדרייבר ערוץ
export interface ChannelDriverInput {
  revenueChannelId: string
  marketingBudget: number
  roiOverride?: number
}

// Expense Group Types
export type ExpenseGroupType = 'fixed' | 'variable'

export const EXPENSE_GROUP_NAMES = [
  'שיווק',
  'כ"א',
  'הנהלה וכלליות',
  'הוצאות ישירות',
  'מימון',
  'בנק ועמלות אשראי',
] as const

export type ExpenseGroupName = typeof EXPENSE_GROUP_NAMES[number]

// Hebrew month names
export const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
] as const

// Traffic Light explanations
export const TRAFFIC_LIGHT_MESSAGES = {
  green: 'מצב תקין - רווחיות חיובית ותזרים יציב',
  yellow: 'נדרשת תשומת לב - רווחיות נמוכה או תנודות בתזרים',
  red: 'אזהרה - הפסדים או תזרים שלילי מתמשך',
} as const

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Form types
export interface BusinessFormData {
  name: string
  ownerName?: string
}

export interface DriverFormData {
  year: number
  month: number
  expectedCustomers: number
  avgRevenuePerCustomer: number
  marketingBudget: number
  headcount: number
  payrollTotal: number
  adminExpenses: number
  creditCardFeeRate: number
  notes?: string
}

export interface LoanFormData {
  principal: number
  interestRate: number
  startDate: string
  endDate: string
  paymentFrequency: string
}

export interface InvestmentFormData {
  name: string
  amount: number
  date: string
  depreciationPeriodMonths: number
}

export interface HistoricalActualFormData {
  year: number
  month: number
  revenueAmountTotal: number
  profitLossTotal: number
  cashFlowTotal?: number
}
