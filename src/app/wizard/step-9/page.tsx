'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWizardStore, FinancingItem } from '@/store/wizard-store'
import { Wallet, ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function Step9Page() {
  const router = useRouter()
  const { financingItems, addFinancingItem, updateFinancingItem, removeFinancingItem, setCurrentStep, completeLayer } = useWizardStore()
  
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [loanName, setLoanName] = useState('')
  const [loanPrincipal, setLoanPrincipal] = useState('')
  const [loanRate, setLoanRate] = useState('')
  const [loanStart, setLoanStart] = useState('1')
  const [loanTerm, setLoanTerm] = useState('24')

  useEffect(() => {
    setCurrentStep(9)
  }, [setCurrentStep])

  // Ensure default financing items exist
  useEffect(() => {
    const hasBank = financingItems.some(f => f.type === 'bank_fees')
    const hasOverdraft = financingItems.some(f => f.type === 'overdraft_interest')
    const hasCC = financingItems.some(f => f.type === 'cc_fee_rate')
    
    if (!hasBank) {
      addFinancingItem({
        id: 'bank_fees',
        type: 'bank_fees',
        name: 'עמלות בנק',
        monthlyAmount: 0,
      })
    }
    if (!hasOverdraft) {
      addFinancingItem({
        id: 'overdraft',
        type: 'overdraft_interest',
        name: 'ריבית עו"ש',
        monthlyAmount: 0,
      })
    }
    if (!hasCC) {
      addFinancingItem({
        id: 'cc_fees',
        type: 'cc_fee_rate',
        name: 'עמלת כרטיסי אשראי',
        percentRate: 0.022,
      })
    }
  }, [])

  const handleAddLoan = () => {
    if (!loanName || !loanPrincipal) return
    
    addFinancingItem({
      id: crypto.randomUUID(),
      type: 'loan',
      name: loanName,
      principal: parseFloat(loanPrincipal),
      interestRate: (parseFloat(loanRate) || 0) / 100,
      startMonth: parseInt(loanStart),
      termMonths: parseInt(loanTerm),
    })
    
    setLoanName('')
    setLoanPrincipal('')
    setLoanRate('')
    setShowLoanForm(false)
  }

  const fixedItems = financingItems.filter(f => f.type !== 'loan')
  const loans = financingItems.filter(f => f.type === 'loan')

  const handleComplete = () => {
    completeLayer(3)
    router.push('/wizard/summary')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>מימון</CardTitle>
            <CardDescription>הגדר הוצאות בנק, עמלות והלוואות</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fixed Finance Items */}
        <div className="space-y-4">
          <h4 className="font-medium">הוצאות בנק ועמלות</h4>
          {fixedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="flex-1 font-medium">{item.name}</span>
              {item.type === 'cc_fee_rate' ? (
                <>
                  <Input
                    type="number"
                    step={0.1}
                    value={item.percentRate ? item.percentRate * 100 : ''}
                    onChange={(e) => updateFinancingItem(item.id, {
                      percentRate: (parseFloat(e.target.value) || 0) / 100
                    })}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">% מההכנסות</span>
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    value={item.monthlyAmount || ''}
                    onChange={(e) => updateFinancingItem(item.id, {
                      monthlyAmount: parseFloat(e.target.value) || 0
                    })}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">₪/חודש</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Loans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">הלוואות</h4>
            {!showLoanForm && (
              <Button variant="outline" size="sm" onClick={() => setShowLoanForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף הלוואה
              </Button>
            )}
          </div>

          {showLoanForm && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="שם ההלוואה"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  placeholder="לדוגמה: הלוואה לציוד"
                />
                <Input
                  label="סכום קרן (₪)"
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="ריבית שנתית (%)"
                  type="number"
                  step={0.1}
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                />
                <Input
                  label="חודש התחלה (1-12)"
                  type="number"
                  min={1}
                  max={12}
                  value={loanStart}
                  onChange={(e) => setLoanStart(e.target.value)}
                />
                <Input
                  label="מספר תשלומים"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddLoan}>הוסף</Button>
                <Button variant="secondary" onClick={() => setShowLoanForm(false)}>ביטול</Button>
              </div>
            </div>
          )}

          {loans.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>קרן</TableHead>
                    <TableHead>ריבית</TableHead>
                    <TableHead>תשלומים</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.name}</TableCell>
                      <TableCell>₪{loan.principal?.toLocaleString()}</TableCell>
                      <TableCell>{((loan.interestRate || 0) * 100).toFixed(1)}%</TableCell>
                      <TableCell>{loan.termMonths} חודשים</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFinancingItem(loan.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              לא הוגדרו הלוואות
            </p>
          )}
        </div>

        {/* Layer 3 Complete */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">כל השכבות הושלמו!</h4>
              <p className="text-sm text-green-600">
                עכשיו תוכל לראות את התחזית המלאה בדשבורד.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={() => router.push('/wizard/step-8')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button onClick={handleComplete}>
            לסיכום
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
