'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface HistoricalActual {
  id: string
  year: number
  month: number
  revenueAmountTotal: number
  profitLossTotal: number
  cashFlowTotal?: number
}

export default function HistoryPage() {
  const params = useParams()
  const businessId = params.id as string
  const [history, setHistory] = useState<HistoricalActual[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Partial<HistoricalActual> | null>(null)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchHistory()
  }, [businessId])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/businesses/${businessId}/history`)
      const data = await res.json()
      if (data.success) {
        setHistory(data.data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(editingRecord.year),
          month: Number(editingRecord.month),
          revenueAmountTotal: Number(editingRecord.revenueAmountTotal) || 0,
          profitLossTotal: Number(editingRecord.profitLossTotal) || 0,
          cashFlowTotal: editingRecord.cashFlowTotal
            ? Number(editingRecord.cashFlowTotal)
            : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        setEditingRecord(null)
        fetchHistory()
      }
    } catch (error) {
      console.error('Error saving record:', error)
    } finally {
      setSaving(false)
    }
  }

  const openNewRecordModal = () => {
    const currentMonth = new Date().getMonth() + 1
    setEditingRecord({
      year: currentYear,
      month: currentMonth > 1 ? currentMonth - 1 : 12,
      revenueAmountTotal: 0,
      profitLossTotal: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (record: HistoricalActual) => {
    setEditingRecord({ ...record })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">היסטוריית ביצועים</h2>
          <p className="text-gray-600">הזן נתוני ביצוע בפועל לחודשים קודמים</p>
        </div>
        <Button onClick={openNewRecordModal}>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          הוסף רשומה
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">אין נתונים היסטוריים</p>
              <Button onClick={openNewRecordModal}>הוסף רשומה ראשונה</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>חודש</TableHead>
                  <TableHead>הכנסות בפועל</TableHead>
                  <TableHead>רווח/הפסד בפועל</TableHead>
                  <TableHead>תזרים בפועל</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {getMonthName(record.month)} {record.year}
                    </TableCell>
                    <TableCell>{formatCurrency(record.revenueAmountTotal)}</TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        record.profitLossTotal >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(record.profitLossTotal)}
                    </TableCell>
                    <TableCell>
                      {record.cashFlowTotal !== null && record.cashFlowTotal !== undefined
                        ? formatCurrency(record.cashFlowTotal)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(record)}
                      >
                        ערוך
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRecord(null)
        }}
        title={editingRecord?.id ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
      >
        <form onSubmit={handleSaveRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="שנה"
              type="number"
              value={editingRecord?.year || currentYear}
              onChange={(e) =>
                setEditingRecord((prev) => ({ ...prev, year: Number(e.target.value) }))
              }
              min={2020}
              max={2100}
              required
            />
            <Input
              label="חודש"
              type="number"
              value={editingRecord?.month || 1}
              onChange={(e) =>
                setEditingRecord((prev) => ({ ...prev, month: Number(e.target.value) }))
              }
              min={1}
              max={12}
              required
            />
          </div>

          <Input
            label="הכנסות בפועל"
            type="number"
            value={editingRecord?.revenueAmountTotal || 0}
            onChange={(e) =>
              setEditingRecord((prev) => ({
                ...prev,
                revenueAmountTotal: Number(e.target.value),
              }))
            }
            min={0}
          />

          <Input
            label="רווח/הפסד בפועל"
            type="number"
            value={editingRecord?.profitLossTotal || 0}
            onChange={(e) =>
              setEditingRecord((prev) => ({
                ...prev,
                profitLossTotal: Number(e.target.value),
              }))
            }
            hint="הזן מספר שלילי להפסד"
          />

          <Input
            label="תזרים בפועל (אופציונלי)"
            type="number"
            value={editingRecord?.cashFlowTotal || ''}
            onChange={(e) =>
              setEditingRecord((prev) => ({
                ...prev,
                cashFlowTotal: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              שמור
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingRecord(null)
              }}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
