'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Select } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'

interface Business {
  id: string
  name: string
  ownerName?: string
}

interface RevenueChannel {
  id: string
  name: string
  isActive: boolean
}

interface ExpenseItem {
  id: string
  name: string
  monthlyAmount: number
  isActive: boolean
  expenseGroup: { id: string; name: string }
}

interface ExpenseGroup {
  id: string
  name: string
}

export default function SettingsPage() {
  const params = useParams()
  const businessId = params.id as string
  const router = useRouter()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [channels, setChannels] = useState<RevenueChannel[]>([])
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([])
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Business edit state
  const [businessName, setBusinessName] = useState('')
  const [businessOwner, setBusinessOwner] = useState('')

  // Modal states
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newExpenseItem, setNewExpenseItem] = useState({
    name: '',
    expenseGroupId: '',
    monthlyAmount: 0,
  })

  useEffect(() => {
    fetchData()
  }, [businessId])

  const fetchData = async () => {
    try {
      const [businessRes, channelsRes, expenseItemsRes, expenseGroupsRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}`),
        fetch(`/api/businesses/${businessId}/revenue-channels`),
        fetch(`/api/businesses/${businessId}/expense-items`),
        fetch('/api/expense-groups'),
      ])

      const businessData = await businessRes.json()
      const channelsData = await channelsRes.json()
      const expenseItemsData = await expenseItemsRes.json()
      const expenseGroupsData = await expenseGroupsRes.json()

      if (businessData.success) {
        setBusiness(businessData.data)
        setBusinessName(businessData.data.name)
        setBusinessOwner(businessData.data.ownerName || '')
      }
      if (channelsData.success) setChannels(channelsData.data)
      if (expenseItemsData.success) setExpenseItems(expenseItemsData.data)
      if (expenseGroupsData.success) {
        setExpenseGroups(expenseGroupsData.data)
        if (expenseGroupsData.data.length > 0) {
          setNewExpenseItem((prev) => ({
            ...prev,
            expenseGroupId: expenseGroupsData.data[0].id,
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBusiness = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          ownerName: businessOwner || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving business:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/revenue-channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName }),
      })

      const data = await res.json()
      if (data.success) {
        setIsChannelModalOpen(false)
        setNewChannelName('')
        fetchData()
      }
    } catch (error) {
      console.error('Error adding channel:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddExpenseItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/expense-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExpenseItem.name,
          expenseGroupId: newExpenseItem.expenseGroupId,
          monthlyAmount: Number(newExpenseItem.monthlyAmount),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setIsExpenseModalOpen(false)
        setNewExpenseItem({
          name: '',
          expenseGroupId: expenseGroups[0]?.id || '',
          monthlyAmount: 0,
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding expense item:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBusiness = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את העסק? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        router.push('/businesses')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">טוען...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">הגדרות עסק</h2>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי העסק</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="שם העסק"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Input
            label="שם בעל העסק"
            value={businessOwner}
            onChange={(e) => setBusinessOwner(e.target.value)}
          />
          <Button onClick={handleSaveBusiness} loading={saving}>
            שמור שינויים
          </Button>
        </CardContent>
      </Card>

      {/* Revenue Channels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ערוצי מכירה</CardTitle>
          <Button size="sm" onClick={() => setIsChannelModalOpen(true)}>
            הוסף ערוץ
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {channels.length === 0 ? (
            <div className="p-8 text-center text-gray-500">אין ערוצי מכירה</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">{channel.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          channel.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {channel.isActive ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expense Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>פריטי הוצאה</CardTitle>
          <Button size="sm" onClick={() => setIsExpenseModalOpen(true)}>
            הוסף פריט
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {expenseItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">אין פריטי הוצאה</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>קבוצה</TableHead>
                  <TableHead>סכום חודשי</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.expenseGroup.name}</TableCell>
                    <TableCell>
                      {item.monthlyAmount.toLocaleString('he-IL', {
                        style: 'currency',
                        currency: 'ILS',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">אזור מסוכן</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            מחיקת העסק תמחק את כל הנתונים הקשורים אליו. פעולה זו לא ניתנת לביטול.
          </p>
          <Button variant="danger" onClick={handleDeleteBusiness}>
            מחק עסק
          </Button>
        </CardContent>
      </Card>

      {/* Channel Modal */}
      <Modal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        title="הוספת ערוץ מכירה"
      >
        <form onSubmit={handleAddChannel} className="space-y-4">
          <Input
            label="שם הערוץ"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder='לדוגמה: "אונליין", "פרונטלי"'
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              הוסף
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsChannelModalOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Modal>

      {/* Expense Item Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="הוספת פריט הוצאה"
      >
        <form onSubmit={handleAddExpenseItem} className="space-y-4">
          <Input
            label="שם הפריט"
            value={newExpenseItem.name}
            onChange={(e) =>
              setNewExpenseItem((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder='לדוגמה: "פרסום בפייסבוק", "שכר דירה"'
            required
          />
          <Select
            label="קבוצת הוצאה"
            value={newExpenseItem.expenseGroupId}
            onChange={(e) =>
              setNewExpenseItem((prev) => ({ ...prev, expenseGroupId: e.target.value }))
            }
            options={expenseGroups.map((g) => ({ value: g.id, label: g.name }))}
          />
          <Input
            label="סכום חודשי"
            type="number"
            value={newExpenseItem.monthlyAmount || ''}
            onChange={(e) =>
              setNewExpenseItem((prev) => ({
                ...prev,
                monthlyAmount: Number(e.target.value),
              }))
            }
            min={0}
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} className="flex-1">
              הוסף
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
