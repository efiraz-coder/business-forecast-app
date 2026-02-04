'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button, Slider } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { 
  Sliders, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/cn'

const MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export default function WhatIfPage() {
  const { 
    businessName,
    products,
    headcountRoles,
    fixedExpenses,
    salesForecasts,
    marketingBudgets,
    financingItems,
    openingBalance,
  } = useWizardStore()

  // Scenario adjustments
  const [salesMultiplier, setSalesMultiplier] = useState(100)
  const [priceMultiplier, setPriceMultiplier] = useState(100)
  const [marketingMultiplier, setMarketingMultiplier] = useState(100)
  const [headcountAdjust, setHeadcountAdjust] = useState(0)
  const [rentMultiplier, setRentMultiplier] = useState(100)
  const [cogsMultiplier, setCogsMultiplier] = useState(100)

  const resetAll = () => {
    setSalesMultiplier(100)
    setPriceMultiplier(100)
    setMarketingMultiplier(100)
    setHeadcountAdjust(0)
    setRentMultiplier(100)
    setCogsMultiplier(100)
  }

  // Calculate base forecast
  const calculateForecast = (
    sales: number, 
    price: number, 
    marketing: number, 
    hcAdjust: number, 
    rent: number,
    cogs: number
  ) => {
    let bankBalance = openingBalance || 0
    const data = []

    for (let month = 1; month <= 12; month++) {
      // Revenue - מחיר × כמות × מכפילים
      let revenue = 0
      products.forEach(product => {
        revenue += product.price * (price / 100) * (product.quantity || 0) * (sales / 100)
      })

      // COGS
      const cogsAmount = revenue * 0.3 * (cogs / 100)

      // Payroll
      const payroll = headcountRoles.reduce((sum, role) => {
        const adjustedCount = Math.max(0, role.headcount + hcAdjust)
        return sum + (adjustedCount * role.avgSalary * (1 + role.employerCostRate))
      }, 0)

      // Marketing
      const marketingAmount = (marketingBudgets.find(m => m.month === month)?.totalBudget || 0) * (marketing / 100)

      // Admin (with rent/property tax adjustment)
      const admin = fixedExpenses.filter(e => e.isEnabled).reduce((sum, e) => {
        const isRentRelated = e.name.includes('שכירות') || e.name.includes('ארנונה')
        const multiplier = isRentRelated ? (rent / 100) : 1
        return sum + (e.monthlyAmount * multiplier)
      }, 0)

      // Finance
      const ccFee = revenue * 0.022
      const bankFees = financingItems.find(f => f.type === 'bank_fees')?.monthlyAmount || 0
      const finance = ccFee + bankFees

      // Loan payments
      const loanPayments = financingItems
        .filter(f => f.type === 'loan' && f.startMonth && month >= f.startMonth)
        .reduce((sum, loan) => {
          if (!loan.principal || !loan.termMonths) return sum
          const monthlyPrincipal = loan.principal / loan.termMonths
          const monthlyInterest = (loan.principal * (loan.interestRate || 0)) / 12
          return sum + monthlyPrincipal + monthlyInterest
        }, 0)

      // Totals
      const grossProfit = revenue - cogsAmount
      const netProfit = grossProfit - payroll - marketingAmount - admin - finance - loanPayments
      bankBalance += netProfit

      data.push({
        month,
        monthName: MONTHS[month - 1],
        revenue: Math.round(revenue),
        netProfit: Math.round(netProfit),
        bankBalance: Math.round(bankBalance),
      })
    }

    return data
  }

  // Base forecast
  const baseForecast = useMemo(() => 
    calculateForecast(100, 100, 100, 0, 100, 100),
    [products, salesForecasts, headcountRoles, marketingBudgets, fixedExpenses, financingItems, openingBalance]
  )

  // Scenario forecast
  const scenarioForecast = useMemo(() => 
    calculateForecast(salesMultiplier, priceMultiplier, marketingMultiplier, headcountAdjust, rentMultiplier, cogsMultiplier),
    [salesMultiplier, priceMultiplier, marketingMultiplier, headcountAdjust, rentMultiplier, cogsMultiplier,
     products, salesForecasts, headcountRoles, marketingBudgets, fixedExpenses, financingItems, openingBalance]
  )

  // Combined chart data
  const chartData = MONTHS.map((name, index) => ({
    name,
    'רווח מקורי': baseForecast[index]?.netProfit || 0,
    'רווח תרחיש': scenarioForecast[index]?.netProfit || 0,
  }))

  const bankChartData = MONTHS.map((name, index) => ({
    name,
    'יתרה מקורית': baseForecast[index]?.bankBalance || 0,
    'יתרה תרחיש': scenarioForecast[index]?.bankBalance || 0,
  }))

  // Summary comparison
  const baseTotal = baseForecast.reduce((sum, m) => sum + m.netProfit, 0)
  const scenarioTotal = scenarioForecast.reduce((sum, m) => sum + m.netProfit, 0)
  const difference = scenarioTotal - baseTotal
  const percentChange = baseTotal !== 0 ? (difference / Math.abs(baseTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">מה יקרה אם...</h1>
              <p className="text-sm text-gray-500">ניתוח תרחישים</p>
            </div>
          </div>
          <Button variant="outline" onClick={resetAll}>
            <RotateCcw className="h-4 w-4 ml-2" />
            איפוס תרחיש
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Sliders Panel */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                פרמטרים לשינוי
              </CardTitle>
              <p className="text-sm text-gray-500">גרור את הסליידרים לשינוי התרחיש</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Slider
                  label="📦 כמות נמכרת"
                  min={50}
                  max={150}
                  step={5}
                  value={[salesMultiplier]}
                  onValueChange={([v]) => setSalesMultiplier(v)}
                  displayValue={`${salesMultiplier}%`}
                />
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <Slider
                  label="💰 מחיר יחידה"
                  min={80}
                  max={120}
                  step={5}
                  value={[priceMultiplier]}
                  onValueChange={([v]) => setPriceMultiplier(v)}
                  displayValue={`${priceMultiplier}%`}
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Slider
                  label="📢 תקציב שיווק"
                  min={50}
                  max={200}
                  step={10}
                  value={[marketingMultiplier]}
                  onValueChange={([v]) => setMarketingMultiplier(v)}
                  displayValue={`${marketingMultiplier}%`}
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <Slider
                  label="👥 שינוי בעובדים"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={[headcountAdjust]}
                  onValueChange={([v]) => setHeadcountAdjust(v)}
                  displayValue={headcountAdjust > 0 ? `+${headcountAdjust}` : `${headcountAdjust}`}
                />
              </div>

              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <Slider
                  label="🏠 שכירות + ארנונה"
                  min={80}
                  max={120}
                  step={5}
                  value={[rentMultiplier]}
                  onValueChange={([v]) => setRentMultiplier(v)}
                  displayValue={`${rentMultiplier}%`}
                />
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <Slider
                  label="📊 עלות מכר (COGS)"
                  min={70}
                  max={130}
                  step={5}
                  value={[cogsMultiplier]}
                  onValueChange={([v]) => setCogsMultiplier(v)}
                  displayValue={`${cogsMultiplier}%`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-gray-500">רווח שנתי - מקורי</p>
                <p className="text-2xl font-bold">₪{baseTotal.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-500">רווח שנתי - תרחיש</p>
                <p className={cn(
                  "text-2xl font-bold",
                  scenarioTotal >= baseTotal ? "text-green-600" : "text-red-600"
                )}>
                  ₪{scenarioTotal.toLocaleString()}
                </p>
              </Card>
              <Card className={cn(
                "p-4",
                difference >= 0 ? "bg-green-50" : "bg-red-50"
              )}>
                <p className="text-sm text-gray-500">הפרש</p>
                <div className="flex items-center gap-2">
                  {difference >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <p className={cn(
                    "text-2xl font-bold",
                    difference >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {difference >= 0 ? '+' : ''}₪{difference.toLocaleString()}
                    <span className="text-sm mr-1">({percentChange.toFixed(1)}%)</span>
                  </p>
                </div>
              </Card>
            </div>

            {/* Profit Chart */}
            <Card>
              <CardHeader>
                <CardTitle>השוואת רווח חודשי</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `₪${v.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="רווח מקורי" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="רווח תרחיש" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bank Balance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>השוואת יתרת בנק</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bankChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `₪${v.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="יתרה מקורית" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="יתרה תרחיש" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
