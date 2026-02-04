'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  Users,
  Megaphone,
  AlertTriangle,
  ArrowLeft,
  Sliders,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { exportToExcel, exportToWord, ExportData } from '@/lib/export-utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts'
import { cn } from '@/lib/cn'

const MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

export default function DashboardPage() {
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

  // Calculate forecast data
  const forecastData = useMemo(() => {
    let bankBalance = openingBalance || 0
    const data = []

    for (let month = 1; month <= 12; month++) {
      // Revenue - מחיר יחידה × כמות נמכרת
      let revenue = 0
      products.forEach(product => {
        revenue += product.price * (product.quantity || 0)
      })

      // COGS (simplified - 30% variable cost)
      const cogs = revenue * 0.3

      // Payroll
      const payroll = headcountRoles.reduce((sum, role) => {
        return sum + (role.headcount * role.avgSalary * (1 + role.employerCostRate))
      }, 0)

      // Marketing
      const marketing = marketingBudgets.find(m => m.month === month)?.totalBudget || 0

      // Fixed expenses
      const admin = fixedExpenses.filter(e => e.isEnabled).reduce((sum, e) => sum + e.monthlyAmount, 0)

      // Finance (simplified)
      const ccFee = revenue * 0.022 // 2.2% credit card
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
      const grossProfit = revenue - cogs
      const operatingExpenses = payroll + marketing + admin
      const netProfit = grossProfit - operatingExpenses - finance - loanPayments
      const cashFlow = netProfit
      bankBalance += cashFlow

      data.push({
        month,
        monthName: MONTHS[month - 1],
        revenue: Math.round(revenue),
        cogs: Math.round(cogs),
        grossProfit: Math.round(grossProfit),
        payroll: Math.round(payroll),
        marketing: Math.round(marketing),
        admin: Math.round(admin),
        finance: Math.round(finance + loanPayments),
        netProfit: Math.round(netProfit),
        cashFlow: Math.round(cashFlow),
        bankBalance: Math.round(bankBalance),
      })
    }

    return data
  }, [products, salesForecasts, headcountRoles, marketingBudgets, fixedExpenses, financingItems, openingBalance])

  // KPIs
  const totalRevenue = forecastData.reduce((sum, m) => sum + m.revenue, 0)
  const totalProfit = forecastData.reduce((sum, m) => sum + m.netProfit, 0)
  const avgMonthlyProfit = totalProfit / 12
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0
  const endingBalance = forecastData[11]?.bankBalance || 0
  const lowestBalance = Math.min(...forecastData.map(m => m.bankBalance))
  const lowestBalanceMonth = forecastData.find(m => m.bankBalance === lowestBalance)?.monthName || ''

  // Chart data for P&L
  const plChartData = forecastData.map(m => ({
    name: m.monthName,
    הכנסות: m.revenue,
    הוצאות: m.cogs + m.payroll + m.marketing + m.admin + m.finance,
    רווח: m.netProfit,
  }))

  // Chart data for cash flow
  const cashFlowData = forecastData.map(m => ({
    name: m.monthName,
    תזרים: m.cashFlow,
    יתרה: m.bankBalance,
  }))

  // Export handlers
  const handleExportExcel = () => {
    const exportData: ExportData = {
      businessName: businessName || 'עסק',
      forecastData,
      kpis: {
        totalRevenue,
        totalProfit,
        profitMargin,
        endingBalance,
      },
    }
    exportToExcel(exportData)
  }

  const handleExportWord = async () => {
    const exportData: ExportData = {
      businessName: businessName || 'עסק',
      forecastData,
      kpis: {
        totalRevenue,
        totalProfit,
        profitMargin,
        endingBalance,
      },
    }
    await exportToWord(exportData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">דשבורד תחזית</h1>
              <p className="text-sm text-gray-500">תחזית ל-12 חודשים קדימה</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExportExcel()}
              className="gap-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportWord()}
              className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
            >
              <FileText className="h-4 w-4" />
              Word
            </Button>
            <Link href="/what-if">
              <Button className="gap-2">
                <Sliders className="h-4 w-4" />
                תרחישים
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="הכנסות שנתיות"
            value={`₪${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <KPICard
            title="רווח נקי שנתי"
            value={`₪${totalProfit.toLocaleString()}`}
            subtitle={`${profitMargin.toFixed(1)}% מרווח`}
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
            color={totalProfit >= 0 ? 'green' : 'red'}
          />
          <KPICard
            title="יתרת בנק סופית"
            value={`₪${endingBalance.toLocaleString()}`}
            icon={PiggyBank}
            color={endingBalance >= 0 ? 'green' : 'red'}
          />
          <KPICard
            title="נקודה הכי נמוכה"
            value={`₪${lowestBalance.toLocaleString()}`}
            subtitle={`ב${lowestBalanceMonth}`}
            icon={lowestBalance < 0 ? AlertTriangle : PiggyBank}
            color={lowestBalance < 0 ? 'amber' : 'gray'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* P&L Chart */}
          <Card>
            <CardHeader>
              <CardTitle>הכנסות, הוצאות ורווח</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={plChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `₪${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="הכנסות" fill="#3b82f6" />
                    <Bar dataKey="הוצאות" fill="#ef4444" />
                    <Line type="monotone" dataKey="רווח" stroke="#10b981" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>תזרים ויתרת בנק</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `₪${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="תזרים" fill="#8b5cf6" />
                    <Area type="monotone" dataKey="יתרה" fill="#10b98133" stroke="#10b981" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>פירוט חודשי</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>חודש</TableHead>
                    <TableHead className="text-left">הכנסות</TableHead>
                    <TableHead className="text-left">עלות מכר</TableHead>
                    <TableHead className="text-left">כ״א</TableHead>
                    <TableHead className="text-left">שיווק</TableHead>
                    <TableHead className="text-left">הנהלה</TableHead>
                    <TableHead className="text-left">רווח נקי</TableHead>
                    <TableHead className="text-left">יתרת בנק</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium">{row.monthName}</TableCell>
                      <TableCell className="text-left">₪{row.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-red-600">₪{row.cogs.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-red-600">₪{row.payroll.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-red-600">₪{row.marketing.toLocaleString()}</TableCell>
                      <TableCell className="text-left text-red-600">₪{row.admin.toLocaleString()}</TableCell>
                      <TableCell className={cn(
                        "text-left font-bold",
                        row.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        ₪{row.netProfit.toLocaleString()}
                      </TableCell>
                      <TableCell className={cn(
                        "text-left font-bold",
                        row.bankBalance >= 0 ? "text-blue-600" : "text-red-600"
                      )}>
                        ₪{row.bankBalance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'red' | 'amber' | 'gray'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
