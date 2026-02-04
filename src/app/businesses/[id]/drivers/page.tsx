'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'

interface Driver {
  id: string
  year: number
  month: number
  totalMarketingBudget: number
  fixedPayroll: number
  adminExpenses: number
  operatingExpenses: number
  creditCardFeeRate: number
  personalLivingExpenses: number
  otherIncome: number
  // Legacy fields
  expectedCustomers: number
  avgRevenuePerCustomer: number
  marketingBudget: number
  headcount: number
  payrollTotal: number
  notes?: string
}

interface RevenueChannel {
  id: string
  name: string
  marketingRoi: number
  variableCostRate: number
}

export default function DriversPage() {
  const params = useParams()
  const businessId = params.id as string
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [channels, setChannels] = useState<RevenueChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Partial<Driver> | null>(null)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [driversRes, channelsRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}/drivers`),
        fetch(`/api/businesses/${businessId}/revenue-channels`),
      ])
      const driversData = await driversRes.json()
      const channelsData = await channelsRes.json()
      
      if (driversData.success) setDrivers(driversData.data)
      if (channelsData.success) setChannels(channelsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return

    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: editingDriver.year,
          month: editingDriver.month,
          totalMarketingBudget: Number(editingDriver.totalMarketingBudget) || 0,
          fixedPayroll: Number(editingDriver.fixedPayroll) || 0,
          adminExpenses: Number(editingDriver.adminExpenses) || 0,
          operatingExpenses: Number(editingDriver.operatingExpenses) || 0,
          creditCardFeeRate: (Number(editingDriver.creditCardFeeRate) || 0) / 100,
          personalLivingExpenses: Number(editingDriver.personalLivingExpenses) || 0,
          otherIncome: Number(editingDriver.otherIncome) || 0,
          // Legacy - keep for backwards compatibility
          expectedCustomers: Number(editingDriver.expectedCustomers) || 0,
          avgRevenuePerCustomer: Number(editingDriver.avgRevenuePerCustomer) || 0,
          marketingBudget: Number(editingDriver.totalMarketingBudget) || 0,
          headcount: Number(editingDriver.headcount) || 0,
          payrollTotal: Number(editingDriver.fixedPayroll) || 0,
          notes: editingDriver.notes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        setEditingDriver(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving driver:', error)
    } finally {
      setSaving(false)
    }
  }

  const openNewDriverModal = () => {
    const currentMonth = new Date().getMonth() + 1
    setEditingDriver({
      year: currentYear,
      month: currentMonth,
      totalMarketingBudget: 0,
      fixedPayroll: 0,
      adminExpenses: 0,
      operatingExpenses: 0,
      creditCardFeeRate: 0,
      personalLivingExpenses: 0,
      otherIncome: 0,
      expectedCustomers: 0,
      avgRevenuePerCustomer: 0,
      headcount: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (driver: Driver) => {
    setEditingDriver({
      ...driver,
      creditCardFeeRate: driver.creditCardFeeRate * 100,
      // Use new fields if available, fallback to legacy
      totalMarketingBudget: driver.totalMarketingBudget || driver.marketingBudget,
      fixedPayroll: driver.fixedPayroll || driver.payrollTotal,
    })
    setIsModalOpen(true)
  }

  // Calculate expected revenue based on ROI
  const calculateExpectedRevenue = (marketingBudget: number) => {
    if (channels.length === 0) return marketingBudget * 3 // Default ROI of 3
    const avgRoi = channels.reduce((sum, ch) => sum + ch.marketingRoi, 0) / channels.length
    return marketingBudget * avgRoi
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">דרייברים חודשיים</h2>
          <p className="text-gray-600">הגדר תקציב שיווק והוצאות לכל חודש (מודל ROI)</p>
        </div>
        <Button onClick={openNewDriverModal}>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          הוסף חודש
        </Button>
      </div>

      {/* ROI Info Card */}
      {channels.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">ערוצי מכירה פעילים: {channels.length}</p>
                <p className="text-sm text-blue-700">
                  יחס החזר שיווקי ממוצע: {(channels.reduce((sum, ch) => sum + ch.marketingRoi, 0) / channels.length).toFixed(1)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען...</div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">עדיין לא הוגדרו דרייברים</p>
              <Button onClick={openNewDriverModal}>הוסף דרייבר ראשון</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>חודש</TableHead>
                  <TableHead>תקציב שיווק</TableHead>
                  <TableHead>הכנסה צפויה</TableHead>
                  <TableHead>שכר קבוע</TableHead>
                  <TableHead>הנהלה</TableHead>
                  <TableHead>הוצאות מחיה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => {
                  const marketingBudget = driver.totalMarketingBudget || driver.marketingBudget
                  return (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        {getMonthName(driver.month)} {driver.year}
                      </TableCell>
                      <TableCell>{formatCurrency(marketingBudget)}</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(calculateExpectedRevenue(marketingBudget))}
                      </TableCell>
                      <TableCell>{formatCurrency(driver.fixedPayroll || driver.payrollTotal)}</TableCell>
                      <TableCell>{formatCurrency(driver.adminExpenses)}</TableCell>
                      <TableCell>{formatCurrency(driver.personalLivingExpenses)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(driver)}
                        >
                          ערוך
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDriver(null)
        }}
        title={editingDriver?.id ? 'עריכת דרייבר' : 'הוספת דרייבר חדש'}
        size="lg"
      >
        <form onSubmit={handleSaveDriver} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="שנה"
              type="number"
              value={editingDriver?.year || currentYear}
              onChange={(e) =>
                setEditingDriver((prev) => ({ ...prev, year: Number(e.target.value) }))
              }
              min={2020}
              max={2100}
              required
            />
            <Input
              label="חודש"
              type="number"
              value={editingDriver?.month || 1}
              onChange={(e) =>
                setEditingDriver((prev) => ({ ...prev, month: Number(e.target.value) }))
              }
              min={1}
              max={12}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">הכנסות (מודל ROI)</h4>
            <Input
              label="תקציב שיווק כולל"
              type="number"
              value={editingDriver?.totalMarketingBudget || 0}
              onChange={(e) =>
                setEditingDriver((prev) => ({
                  ...prev,
                  totalMarketingBudget: Number(e.target.value),
                }))
              }
              min={0}
              hint={`הכנסה צפויה: ${formatCurrency(calculateExpectedRevenue(editingDriver?.totalMarketingBudget || 0))}`}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">הוצאות קבועות</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="שכר קבוע (לא תלוי בהכנסה)"
                type="number"
                value={editingDriver?.fixedPayroll || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    fixedPayroll: Number(e.target.value),
                  }))
                }
                min={0}
              />
              <Input
                label="הנהלה וכלליות"
                type="number"
                value={editingDriver?.adminExpenses || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    adminExpenses: Number(e.target.value),
                  }))
                }
                min={0}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="הוצאות תפעול (SEO, תוכנות)"
                type="number"
                value={editingDriver?.operatingExpenses || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    operatingExpenses: Number(e.target.value),
                  }))
                }
                min={0}
              />
              <Input
                label="אחוז עמלת כרטיסי אשראי"
                type="number"
                value={editingDriver?.creditCardFeeRate || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    creditCardFeeRate: Number(e.target.value),
                  }))
                }
                min={0}
                max={100}
                step={0.1}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">יתרה לחיסכון (מודל בן)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="הוצאות מחיה אישיות"
                type="number"
                value={editingDriver?.personalLivingExpenses || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    personalLivingExpenses: Number(e.target.value),
                  }))
                }
                min={0}
              />
              <Input
                label="הכנסות נוספות (מחוץ לעסק)"
                type="number"
                value={editingDriver?.otherIncome || 0}
                onChange={(e) =>
                  setEditingDriver((prev) => ({
                    ...prev,
                    otherIncome: Number(e.target.value),
                  }))
                }
                min={0}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              שמור
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingDriver(null)
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
