'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useWizardStore } from '@/store/wizard-store'
import { TrendingUp, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react'

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export default function Step5Page() {
  const router = useRouter()
  const { products, salesForecasts, setSalesForecast, setCurrentStep } = useWizardStore()
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '')
  const [inputMethod, setInputMethod] = useState<'quick' | 'manual'>('quick')
  const [quickBase, setQuickBase] = useState('')
  const [quickGrowth, setQuickGrowth] = useState('5')

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  // Get forecasts for selected product
  const productForecasts = salesForecasts.filter(f => f.productId === selectedProduct)
  const getUnitsForMonth = (month: number) => {
    const forecast = productForecasts.find(f => f.month === month)
    return forecast?.units || 0
  }

  // Apply quick fill
  const applyQuickFill = () => {
    const base = parseInt(quickBase) || 0
    const growth = (parseFloat(quickGrowth) || 0) / 100

    for (let month = 1; month <= 12; month++) {
      const units = Math.round(base * Math.pow(1 + growth, month - 1))
      setSalesForecast(selectedProduct, month, units)
    }
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)
  const totalUnits = Array.from({ length: 12 }, (_, i) => getUnitsForMonth(i + 1)).reduce((a, b) => a + b, 0)
  const totalRevenue = totalUnits * (selectedProductData?.price || 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>תחזית מכירות</CardTitle>
            <CardDescription>הגדר את כמות המכירות הצפויה לכל מוצר ב-12 החודשים הקרובים</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selector */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger label="בחר מוצר/שירות">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (₪{product.price.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={inputMethod} onValueChange={(v) => setInputMethod(v as typeof inputMethod)}>
              <SelectTrigger label="שיטת הזנה">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">מהיר (בסיס + גידול)</SelectItem>
                <SelectItem value="manual">ידני לכל חודש</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Fill */}
        {inputMethod === 'quick' && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <div className="flex gap-4 items-end">
              <Input
                label="כמות בסיס (חודש 1)"
                type="number"
                value={quickBase}
                onChange={(e) => setQuickBase(e.target.value)}
                className="w-40"
              />
              <Input
                label="אחוז גידול חודשי"
                type="number"
                value={quickGrowth}
                onChange={(e) => setQuickGrowth(e.target.value)}
                className="w-32"
              />
              <Button onClick={applyQuickFill}>
                <Wand2 className="h-4 w-4 ml-2" />
                מלא אוטומטית
              </Button>
            </div>
            <p className="text-sm text-blue-600">
              התחזית תמלא אוטומטית עם {quickBase || 0} יחידות בחודש הראשון 
              וגידול של {quickGrowth}% בכל חודש
            </p>
          </div>
        )}

        {/* Monthly Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>חודש</TableHead>
                <TableHead className="w-32">כמות יחידות</TableHead>
                <TableHead className="text-left">הכנסה צפויה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MONTHS.map((monthName, index) => {
                const month = index + 1
                const units = getUnitsForMonth(month)
                const revenue = units * (selectedProductData?.price || 0)
                
                return (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{monthName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={units || ''}
                        onChange={(e) => setSalesForecast(
                          selectedProduct, 
                          month, 
                          parseInt(e.target.value) || 0
                        )}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-left text-green-600 font-medium">
                      ₪{revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">סה״כ יחידות שנתי:</span>
              <p className="text-xl font-bold">{totalUnits.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">סה״כ הכנסה שנתית:</span>
              <p className="text-xl font-bold text-green-600">₪{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-4')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button onClick={() => router.push('/wizard/step-6')}>
            המשך
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
