'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { Receipt, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function Step4Page() {
  const router = useRouter()
  const { fixedExpenses, updateFixedExpense, setCurrentStep, completeLayer } = useWizardStore()

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const enabledExpenses = fixedExpenses.filter(e => e.monthlyAmount > 0)
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + (e.monthlyAmount || 0), 0)

  const handleAmountChange = (id: string, value: string) => {
    const amount = parseInt(value) || 0
    updateFixedExpense(id, { 
      monthlyAmount: amount,
      isEnabled: amount > 0
    })
  }

  const handleComplete = () => {
    completeLayer(1)
    router.push('/wizard/step-5')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>הוצאות קבועות</CardTitle>
            <CardDescription>הזן את הסכומים להוצאות הקבועות של העסק (השאר 0 אם לא רלוונטי)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3">
          {fixedExpenses.map((expense) => (
            <div
              key={expense.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all",
                expense.monthlyAmount > 0 
                  ? "bg-white border-primary/30 shadow-sm" 
                  : "bg-gray-50/50 border-gray-200"
              )}
            >
              <div className="flex-1">
                <span className={cn(
                  "font-medium",
                  expense.monthlyAmount > 0 ? "text-gray-900" : "text-gray-600"
                )}>
                  {expense.name}
                </span>
                <span className="text-xs text-gray-400 mr-2">
                  ({expense.category === 'admin' ? 'הנהלה' : 
                    expense.category === 'finance' ? 'מימון' : 'תפעול'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={expense.monthlyAmount || ''}
                  onChange={(e) => handleAmountChange(expense.id, e.target.value)}
                  className="w-28 text-center"
                  placeholder="0"
                />
                <span className="text-gray-500 text-sm">₪/חודש</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">סה״כ הוצאות קבועות:</span>
            <span className="text-2xl font-bold text-primary">
              ₪{totalFixed.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {enabledExpenses.length} סעיפים פעילים מתוך {fixedExpenses.length}
          </p>
        </div>

        {/* Layer 1 Complete */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">שכבה 1 הושלמה!</h4>
              <p className="text-sm text-green-600">
                המערכת יכולה לחשב תחזית בסיסית עכשיו. 
                בשכבה 2 תוכל להוסיף תחזיות כמותיות מדויקות.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push('/wizard/step-3')}>
              <ArrowRight className="h-4 w-4 ml-2" />
              חזרה
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                if (confirm('האם לאפס את כל הנתונים ולהתחיל מחדש?')) {
                  localStorage.removeItem('wizard-storage')
                  window.location.href = '/wizard/step-1'
                }
              }}
            >
              התחל מחדש
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              עבור לדשבורד
            </Button>
            <Button onClick={handleComplete}>
              המשך לשכבה 2
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
