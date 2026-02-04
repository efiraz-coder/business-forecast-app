'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { FileText, ArrowLeft, ArrowRight, Info } from 'lucide-react'

export default function Step8Page() {
  const router = useRouter()
  const { setCurrentStep, fixedExpenses } = useWizardStore()

  useEffect(() => {
    setCurrentStep(8)
  }, [setCurrentStep])

  const enabledExpenses = fixedExpenses.filter(e => e.isEnabled)
  const totalMonthly = enabledExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>הוצאות הנהלה מפורטות</CardTitle>
            <CardDescription>פירוט חודשי של הוצאות הנהלה וכלליות (אופציונלי)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p>
              שכבה זו מאפשרת לך להגדיר סכומים שונים לכל חודש (למשל, העלאת שכירות בחודש 6).
              אם ההוצאות הקבועות שלך לא משתנות במהלך השנה, תוכל לדלג על שלב זה.
            </p>
          </div>
        </div>

        {/* Summary from Layer 1 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">הוצאות קבועות (משכבה 1):</h4>
          <div className="space-y-2">
            {enabledExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between">
                <span>{expense.name}</span>
                <span className="font-medium">₪{expense.monthlyAmount.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>סה״כ חודשי:</span>
              <span>₪{totalMonthly.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          כרגע, פירוט חודשי מפורט לא מוגדר. הסכומים משכבה 1 ישמשו לכל החודשים.
        </p>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-7')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button onClick={() => router.push('/wizard/step-9')}>
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
