'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { 
  BarChart3, 
  Building2, 
  Package, 
  Users, 
  Receipt, 
  TrendingUp,
  Megaphone,
  Wallet,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/cn'

export default function SummaryPage() {
  const router = useRouter()
  const { 
    businessName, 
    industry, 
    products, 
    headcountRoles,
    fixedExpenses,
    salesForecasts,
    marketingBudgets,
    financingItems,
    setCurrentStep,
    layer1Done,
    layer2Done,
    layer3Done
  } = useWizardStore()

  useEffect(() => {
    setCurrentStep(10)
  }, [setCurrentStep])

  // Calculate summaries
  const totalProducts = products.length
  const totalEmployees = headcountRoles.reduce((sum, r) => sum + r.headcount, 0)
  const totalMonthlyPayroll = headcountRoles.reduce((sum, r) => sum + (r.headcount * r.avgSalary * (1 + r.employerCostRate)), 0)
  const totalFixedExpenses = fixedExpenses.filter(e => e.isEnabled).reduce((sum, e) => sum + e.monthlyAmount, 0)
  const totalAnnualMarketing = marketingBudgets.reduce((sum, b) => sum + b.totalBudget, 0)
  const loans = financingItems.filter(f => f.type === 'loan')

  // Calculate estimated annual revenue from sales forecasts
  const annualRevenue = products.reduce((total, product) => {
    const productSales = salesForecasts
      .filter(s => s.productId === product.id)
      .reduce((sum, s) => sum + s.units, 0)
    return total + (productSales * product.price)
  }, 0)

  const summaryItems = [
    {
      icon: Building2,
      title: 'פרטי עסק',
      value: businessName || 'לא הוגדר',
      subtitle: industry || 'לא הוגדר תחום',
      done: !!businessName,
    },
    {
      icon: Package,
      title: 'מוצרים/שירותים',
      value: `${totalProducts} פריטים`,
      subtitle: annualRevenue > 0 ? `הכנסה צפויה: ₪${annualRevenue.toLocaleString()}` : '',
      done: totalProducts > 0,
    },
    {
      icon: Users,
      title: 'כוח אדם',
      value: `${totalEmployees} עובדים`,
      subtitle: `עלות חודשית: ₪${totalMonthlyPayroll.toLocaleString()}`,
      done: totalEmployees > 0 || totalMonthlyPayroll > 0,
    },
    {
      icon: Receipt,
      title: 'הוצאות קבועות',
      value: `₪${totalFixedExpenses.toLocaleString()}/חודש`,
      subtitle: `${fixedExpenses.filter(e => e.isEnabled).length} סעיפים`,
      done: true,
    },
    {
      icon: Megaphone,
      title: 'שיווק',
      value: `₪${totalAnnualMarketing.toLocaleString()}/שנה`,
      subtitle: marketingBudgets.length > 0 ? `${marketingBudgets.length} חודשים מוגדרים` : 'לא הוגדר',
      done: marketingBudgets.length > 0,
    },
    {
      icon: Wallet,
      title: 'מימון',
      value: loans.length > 0 ? `${loans.length} הלוואות` : 'ללא הלוואות',
      subtitle: loans.length > 0 ? `סה"כ קרן: ₪${loans.reduce((s, l) => s + (l.principal || 0), 0).toLocaleString()}` : '',
      done: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>סיכום התכנון</CardTitle>
            <CardDescription>סקירה של כל הנתונים שהזנת</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layers Status */}
        <div className="flex gap-4">
          <LayerBadge number={1} label="ליבה" done={layer1Done} />
          <LayerBadge number={2} label="תחזית" done={layer2Done} />
          <LayerBadge number={3} label="מתקדם" done={layer3Done} />
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4">
          {summaryItems.map((item) => (
            <div
              key={item.title}
              className={cn(
                "p-4 rounded-lg border",
                item.done ? "bg-white" : "bg-gray-50 border-dashed"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  item.done ? "bg-primary/10" : "bg-gray-200"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    item.done ? "text-primary" : "text-gray-400"
                  )} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-lg font-bold">{item.value}</p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  )}
                </div>
                {item.done && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">מוכן לראות את התחזית?</h3>
          <p className="text-gray-600">
            על בסיס הנתונים שהזנת, המערכת תחשב תחזית מפורטת ל-12 חודשים קדימה
          </p>
          <Button size="lg" onClick={() => router.push('/dashboard')}>
            <TrendingUp className="h-5 w-5 ml-2" />
            עבור לדשבורד
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <Button variant="outline" onClick={() => router.push('/wizard/step-1')}>
            חזור לעריכה
          </Button>
          <Button variant="outline" onClick={() => router.push('/what-if')}>
            ניתוח תרחישים
          </Button>
          <Button variant="secondary" onClick={() => {
            // Save to DB would go here
            router.push('/dashboard')
          }}>
            שמור וצא
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LayerBadge({ number, label, done }: { number: number; label: string; done: boolean }) {
  return (
    <div className={cn(
      "flex-1 p-3 rounded-lg text-center",
      done ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
    )}>
      <div className="text-lg font-bold">שכבה {number}</div>
      <div className="text-sm">{label}</div>
      {done && <CheckCircle2 className="h-4 w-4 mx-auto mt-1" />}
    </div>
  )
}
