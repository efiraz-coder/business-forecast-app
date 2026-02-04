'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWizardStore } from '@/store/wizard-store'
import { UserPlus, ArrowLeft, ArrowRight, Info } from 'lucide-react'

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export default function Step6Page() {
  const router = useRouter()
  const { headcountRoles, headcountForecasts, setHeadcountForecast, setCurrentStep } = useWizardStore()

  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const getChangeForMonth = (roleId: string, month: number) => {
    const forecast = headcountForecasts.find(f => f.roleId === roleId && f.month === month)
    return {
      headcountChange: forecast?.headcountChange || 0,
      salaryChange: forecast?.salaryChange || 0,
    }
  }

  // Calculate cumulative headcount for display
  const getCumulativeHeadcount = (roleId: string, month: number) => {
    const role = headcountRoles.find(r => r.id === roleId)
    if (!role) return 0
    
    let count = role.headcount
    for (let m = 1; m <= month; m++) {
      const change = getChangeForMonth(roleId, m)
      count += change.headcountChange
    }
    return Math.max(0, count)
  }

  const activeRoles = headcountRoles.filter(r => r.headcount > 0 || r.avgSalary > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>תחזית כוח אדם</CardTitle>
            <CardDescription>הגדר שינויים צפויים בכמות העובדים ובשכר</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">איך להשתמש:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>שינוי בכמות:</strong> הזן +1 להוספת עובד, -1 לפיטורים</li>
              <li><strong>העלאת שכר:</strong> הזן אחוז (למשל 8 עבור העלאה של 8%)</li>
              <li>השינויים מצטברים - אם הוספת עובד בחודש 3, הוא נשאר גם בחודשים הבאים</li>
            </ul>
          </div>
        </div>

        {activeRoles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>לא הוגדרו עובדים בשכבה 1</p>
            <Button variant="link" onClick={() => router.push('/wizard/step-3')}>
              חזור לשכבת כוח אדם
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeRoles.map((role) => (
              <div key={role.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 font-medium flex justify-between items-center">
                  <span>{role.name}</span>
                  <span className="text-sm text-gray-500">
                    התחלה: {role.headcount} עובדים | ₪{role.avgSalary.toLocaleString()}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>חודש</TableHead>
                      <TableHead className="w-32">שינוי כמות</TableHead>
                      <TableHead className="w-32">העלאת שכר (%)</TableHead>
                      <TableHead className="text-left w-40">סה״כ עובדים</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MONTHS.map((monthName, index) => {
                      const month = index + 1
                      const { headcountChange, salaryChange } = getChangeForMonth(role.id, month)
                      const cumulative = getCumulativeHeadcount(role.id, month)
                      
                      return (
                        <TableRow key={month}>
                          <TableCell className="font-medium">{monthName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={headcountChange || ''}
                              onChange={(e) => setHeadcountForecast(
                                role.id,
                                month,
                                parseInt(e.target.value) || 0,
                                salaryChange
                              )}
                              className="w-20"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              value={salaryChange ? salaryChange * 100 : ''}
                              onChange={(e) => setHeadcountForecast(
                                role.id,
                                month,
                                headcountChange,
                                (parseFloat(e.target.value) || 0) / 100
                              )}
                              className="w-20"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell className="text-left font-medium">
                            {cumulative}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-5')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button onClick={() => router.push('/wizard/step-7')}>
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
