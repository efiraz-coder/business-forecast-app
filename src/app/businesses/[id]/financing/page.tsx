'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

interface Loan {
  id: string
  name: string
  principal: number
  interestRate: number
  startDate: string
  endDate: string
  paymentFrequency: string
}

interface Investment {
  id: string
  name: string
  amount: number
  date: string
  depreciationPeriodMonths: number
}

export default function FinancingPage() {
  const params = useParams()
  const businessId = params.id as string
  const [loans, setLoans] = useState<Loan[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [newLoan, setNewLoan] = useState({
    name: '',
    principal: 0,
    interestRate: 0,
    startDate: '',
    endDate: '',
  })
  
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    amount: 0,
    date: '',
    depreciationPeriodMonths: 0,
  })

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [loansRes, investmentsRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}/loans`),
        fetch(`/api/businesses/${businessId}/investments`),
      ])
      
      const loansData = await loansRes.json()
      const investmentsData = await investmentsRes.json()
      
      if (loansData.success) setLoans(loansData.data)
      if (investmentsData.success) setInvestments(investmentsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const res = await fetch(`/api/businesses/${businessId}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLoan.name || 'הלוואה',
          principal: Number(newLoan.principal),
          interestRate: Number(newLoan.interestRate) / 100,
          startDate: newLoan.startDate,
          endDate: newLoan.endDate,
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setIsLoanModalOpen(false)
        setNewLoan({ name: '', principal: 0, interestRate: 0, startDate: '', endDate: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error saving loan:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const res = await fetch(`/api/businesses/${businessId}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInvestment.name,
          amount: Number(newInvestment.amount),
          date: newInvestment.date,
          depreciationPeriodMonths: Number(newInvestment.depreciationPeriodMonths),
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setIsInvestmentModalOpen(false)
        setNewInvestment({ name: '', amount: 0, date: '', depreciationPeriodMonths: 0 })
        fetchData()
      }
    } catch (error) {
      console.error('Error saving investment:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL')
  }

  return (
    <div className="space-y-6">
      {/* Loans Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>הלוואות</CardTitle>
          <Button size="sm" onClick={() => setIsLoanModalOpen(true)}>
            הוסף הלוואה
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען...</div>
          ) : loans.length === 0 ? (
            <div className="p-8 text-center text-gray-500">אין הלוואות רשומות</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>סכום קרן</TableHead>
                  <TableHead>ריבית שנתית</TableHead>
                  <TableHead>תאריך התחלה</TableHead>
                  <TableHead>תאריך סיום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.name}</TableCell>
                    <TableCell>{formatCurrency(loan.principal)}</TableCell>
                    <TableCell>{(loan.interestRate * 100).toFixed(1)}%</TableCell>
                    <TableCell>{formatDate(loan.startDate)}</TableCell>
                    <TableCell>{formatDate(loan.endDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Investments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>השקעות הוניות</CardTitle>
          <Button size="sm" onClick={() => setIsInvestmentModalOpen(true)}>
            הוסף השקעה
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען...</div>
          ) : investments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">אין השקעות רשומות</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>תאריך</TableHead>
                  <TableHead>תקופת פחת (חודשים)</TableHead>
                  <TableHead>פחת חודשי</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.name}</TableCell>
                    <TableCell>{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell>{inv.depreciationPeriodMonths || '-'}</TableCell>
                    <TableCell>
                      {inv.depreciationPeriodMonths > 0
                        ? formatCurrency(inv.amount / inv.depreciationPeriodMonths)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Loan Modal */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="הוספת הלוואה"
      >
        <form onSubmit={handleSaveLoan} className="space-y-4">
          <Input
            label="שם ההלוואה"
            value={newLoan.name}
            onChange={(e) => setNewLoan((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="לדוגמה: הלוואה מהבנק"
          />
          <Input
            label="סכום קרן"
            type="number"
            value={newLoan.principal || ''}
            onChange={(e) => setNewLoan((prev) => ({ ...prev, principal: Number(e.target.value) }))}
            required
            min={0}
          />
          <Input
            label="ריבית שנתית (%)"
            type="number"
            value={newLoan.interestRate || ''}
            onChange={(e) => setNewLoan((prev) => ({ ...prev, interestRate: Number(e.target.value) }))}
            required
            min={0}
            max={100}
            step={0.1}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="תאריך התחלה"
              type="date"
              value={newLoan.startDate}
              onChange={(e) => setNewLoan((prev) => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <Input
              label="תאריך סיום"
              type="date"
              value={newLoan.endDate}
              onChange={(e) => setNewLoan((prev) => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              שמור
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsLoanModalOpen(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </Modal>

      {/* Investment Modal */}
      <Modal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        title="הוספת השקעה"
      >
        <form onSubmit={handleSaveInvestment} className="space-y-4">
          <Input
            label="שם ההשקעה"
            value={newInvestment.name}
            onChange={(e) => setNewInvestment((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="לדוגמה: מכונת קפה"
            required
          />
          <Input
            label="סכום"
            type="number"
            value={newInvestment.amount || ''}
            onChange={(e) => setNewInvestment((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            required
            min={0}
          />
          <Input
            label="תאריך רכישה"
            type="date"
            value={newInvestment.date}
            onChange={(e) => setNewInvestment((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
          <Input
            label="תקופת פחת (חודשים)"
            type="number"
            value={newInvestment.depreciationPeriodMonths || ''}
            onChange={(e) =>
              setNewInvestment((prev) => ({
                ...prev,
                depreciationPeriodMonths: Number(e.target.value),
              }))
            }
            min={0}
            hint="השאר 0 אם אין פחת"
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              שמור
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsInvestmentModalOpen(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
