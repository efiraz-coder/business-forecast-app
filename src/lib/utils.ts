import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL').format(value)
}

export function getMonthName(month: number): string {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ]
  return months[month - 1] || ''
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function addMonths(year: number, month: number, add: number): { year: number; month: number } {
  const totalMonths = year * 12 + month - 1 + add
  return {
    year: Math.floor(totalMonths / 12),
    month: (totalMonths % 12) + 1,
  }
}

export function calculateMonthlyLoanPayment(
  principal: number,
  annualInterestRate: number,
  totalMonths: number
): number {
  if (totalMonths <= 0) return 0
  if (annualInterestRate === 0) return principal / totalMonths
  
  const monthlyRate = annualInterestRate / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                  (Math.pow(1 + monthlyRate, totalMonths) - 1)
  return payment
}

export function calculateMonthlyDepreciation(
  amount: number,
  periodMonths: number
): number {
  if (periodMonths <= 0) return 0
  return amount / periodMonths
}
