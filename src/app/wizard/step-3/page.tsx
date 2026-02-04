'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { Users, ArrowLeft, ArrowRight } from 'lucide-react'

export default function Step3Page() {
  const router = useRouter()
  const { headcountRoles, updateHeadcountRole, setCurrentStep } = useWizardStore()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const totalPayroll = headcountRoles.reduce((sum, role) => {
    return sum + (role.headcount * role.avgSalary * (1 + role.employerCostRate))
  }, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>כוח אדם</CardTitle>
            <CardDescription>הגדר את מספר העובדים ושכרם לפי תפקיד</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תפקיד</TableHead>
                <TableHead className="w-32">כמות (משרות)</TableHead>
                <TableHead className="w-40">שכר ממוצע (₪)</TableHead>
                <TableHead className="w-40">עלות מעסיק (%)</TableHead>
                <TableHead className="w-40 text-left">עלות חודשית</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headcountRoles.map((role) => {
                const monthlyCost = role.headcount * role.avgSalary * (1 + role.employerCostRate)
                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={role.headcount}
                        onChange={(e) => updateHeadcountRole(role.id, { 
                          headcount: parseFloat(e.target.value) || 0 
                        })}
                        className="w-24"
                        placeholder="0.5"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={role.avgSalary}
                        onChange={(e) => updateHeadcountRole(role.id, { 
                          avgSalary: parseInt(e.target.value) || 0 
                        })}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={role.employerCostRate * 100}
                        onChange={(e) => updateHeadcountRole(role.id, { 
                          employerCostRate: (parseFloat(e.target.value) || 0) / 100
                        })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      {monthlyCost > 0 ? `₪${monthlyCost.toLocaleString()}` : '-'}
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
            <span className="font-medium">סה״כ עלות כ״א חודשית:</span>
            <span className="text-2xl font-bold text-primary">
              ₪{totalPayroll.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            כולל עלות מעסיק (ביטוח לאומי, פנסיה, וכו׳)
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-2')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button onClick={() => router.push('/wizard/step-4')}>
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
