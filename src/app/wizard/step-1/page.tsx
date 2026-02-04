'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { Building2, ArrowLeft } from 'lucide-react'

const INDUSTRIES = [
  { value: 'services', label: 'שירותים' },
  { value: 'retail', label: 'מסחר' },
  { value: 'manufacturing', label: 'ייצור' },
  { value: 'digital', label: 'דיגיטל' },
  { value: 'other', label: 'אחר' },
]

export default function Step1Page() {
  const router = useRouter()
  const { 
    businessName, 
    industry, 
    startDate, 
    openingBalance,
    setBusinessInfo, 
    setCurrentStep 
  } = useWizardStore()

  const [name, setName] = useState(businessName)
  const [selectedIndustry, setSelectedIndustry] = useState(industry)
  const [date, setDate] = useState(startDate || new Date().toISOString().slice(0, 7))
  const [balance, setBalance] = useState(openingBalance.toString())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!name.trim()) {
      newErrors.name = 'נא להזין שם עסק'
    }
    if (!selectedIndustry) {
      newErrors.industry = 'נא לבחור תחום'
    }
    if (!date) {
      newErrors.date = 'נא לבחור חודש התחלה'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validate()) return

    setBusinessInfo(name, selectedIndustry, date, Number(balance) || 0)
    router.push('/wizard/step-2')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>פרטי עסק</CardTitle>
            <CardDescription>הזן את הפרטים הבסיסיים של העסק</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* שורה 1: שם העסק */}
        <Input
          label="שם העסק"
          placeholder="לדוגמה: חנות הספרים של יוסי"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        {/* שורה 2: תחום + חודש התחלה - זה לזה */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger label="תחום פעילות">
                <SelectValue placeholder="בחר תחום" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-xs text-destructive">{errors.industry}</p>
            )}
          </div>

          <Input
            label="חודש התחלה"
            type="month"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            hint="החודש הראשון של התחזית"
          />
        </div>

        {/* שורה 3: יתרת פתיחה */}
        <Input
          label="יתרת פתיחה בבנק (₪)"
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          hint="היתרה בחשבון הבנק בתחילת התקופה (ניתן להשאיר 0)"
        />

        {/* ניווט */}
        <div className="flex justify-between pt-4 border-t">
          <div></div>
          <Button onClick={handleNext}>
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
