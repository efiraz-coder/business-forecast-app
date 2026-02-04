'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { Megaphone, ArrowLeft, ArrowRight, Wand2, CheckCircle2 } from 'lucide-react'

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export default function Step7Page() {
  const router = useRouter()
  const { marketingBudgets, setMarketingBudget, setCurrentStep, completeLayer } = useWizardStore()
  
  // Quick fill state
  const [quickBudget, setQuickBudget] = useState('')
  const [quickGrowth, setQuickGrowth] = useState('3')
  const [googlePct, setGooglePct] = useState('50')
  const [facebookPct, setFacebookPct] = useState('40')
  const [seoPct, setSeoPct] = useState('10')
  const [hasAgency, setHasAgency] = useState(false)
  const [agencyFixed, setAgencyFixed] = useState('')
  const [agencyPct, setAgencyPct] = useState('15')

  useEffect(() => {
    setCurrentStep(7)
  }, [setCurrentStep])

  const getBudgetForMonth = (month: number) => {
    return marketingBudgets.find(b => b.month === month)
  }

  const applyQuickFill = () => {
    const base = parseInt(quickBudget) || 0
    const growth = (parseFloat(quickGrowth) || 0) / 100

    for (let month = 1; month <= 12; month++) {
      const budget = Math.round(base * Math.pow(1 + growth, month - 1))
      setMarketingBudget(month, {
        totalBudget: budget,
        googlePercent: parseFloat(googlePct) || 0,
        facebookPercent: parseFloat(facebookPct) || 0,
        seoPercent: parseFloat(seoPct) || 0,
        otherPercent: 100 - (parseFloat(googlePct) || 0) - (parseFloat(facebookPct) || 0) - (parseFloat(seoPct) || 0),
        hasAgency,
        agencyFixedFee: parseFloat(agencyFixed) || 0,
        agencyPercentFee: parseFloat(agencyPct) || 0,
      })
    }
  }

  const totalBudget = marketingBudgets.reduce((sum, b) => sum + b.totalBudget, 0)

  const handleComplete = () => {
    completeLayer(2)
    router.push('/wizard/step-8')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>תקציב שיווק</CardTitle>
            <CardDescription>הגדר את תקציב השיווק החודשי וחלוקתו לפי ערוצים</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Fill */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium">מילוי מהיר</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="תקציב חודש 1 (₪)"
              type="number"
              value={quickBudget}
              onChange={(e) => setQuickBudget(e.target.value)}
            />
            <Input
              label="גידול חודשי (%)"
              type="number"
              value={quickGrowth}
              onChange={(e) => setQuickGrowth(e.target.value)}
            />
            <div></div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Input
              label="Google Ads (%)"
              type="number"
              value={googlePct}
              onChange={(e) => setGooglePct(e.target.value)}
            />
            <Input
              label="Facebook/Instagram (%)"
              type="number"
              value={facebookPct}
              onChange={(e) => setFacebookPct(e.target.value)}
            />
            <Input
              label="SEO (%)"
              type="number"
              value={seoPct}
              onChange={(e) => setSeoPct(e.target.value)}
            />
            <div className="flex items-end">
              <span className="text-sm text-gray-500 pb-2">
                אחר: {100 - (parseFloat(googlePct) || 0) - (parseFloat(facebookPct) || 0) - (parseFloat(seoPct) || 0)}%
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <Checkbox
              label="יש סוכנות שיווק"
              checked={hasAgency}
              onCheckedChange={(checked) => setHasAgency(!!checked)}
            />
            {hasAgency && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input
                  label="תשלום קבוע לסוכנות (₪)"
                  type="number"
                  value={agencyFixed}
                  onChange={(e) => setAgencyFixed(e.target.value)}
                />
                <Input
                  label="אחוז מתקציב השיווק"
                  type="number"
                  value={agencyPct}
                  onChange={(e) => setAgencyPct(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button onClick={applyQuickFill}>
            <Wand2 className="h-4 w-4 ml-2" />
            החל על כל החודשים
          </Button>
        </div>

        {/* Monthly Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>חודש</TableHead>
                <TableHead className="w-32">תקציב (₪)</TableHead>
                <TableHead className="text-left">פירוט</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MONTHS.map((monthName, index) => {
                const month = index + 1
                const budget = getBudgetForMonth(month)
                
                return (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{monthName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={budget?.totalBudget || ''}
                        onChange={(e) => setMarketingBudget(month, {
                          totalBudget: parseInt(e.target.value) || 0,
                        })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="text-left text-sm text-gray-500">
                      {budget?.totalBudget ? (
                        <>
                          Google: {budget.googlePercent}% | 
                          FB: {budget.facebookPercent}% | 
                          SEO: {budget.seoPercent}%
                          {budget.hasAgency && ` + סוכנות`}
                        </>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">סה״כ תקציב שיווק שנתי:</span>
            <span className="text-2xl font-bold text-primary">
              ₪{totalBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Layer 2 Complete */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">שכבה 2 הושלמה!</h4>
              <p className="text-sm text-green-600">
                עכשיו יש לך תחזית כמותית מלאה. שכבה 3 היא אופציונלית לפירוט מתקדם.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-6')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              עבור לדשבורד
            </Button>
            <Button onClick={handleComplete}>
              המשך לשכבה 3
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
