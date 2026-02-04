'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Modal, Card } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'

interface Business {
  id: string
  name: string
  ownerName?: string
  createdAt: string
  _count: {
    drivers: number
    loans: number
    investments: number
  }
}

export default function BusinessesPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [newBusinessOwner, setNewBusinessOwner] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses')
      const data = await res.json()
      if (data.success) {
        setBusinesses(data.data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newBusinessName, 
          ownerName: newBusinessOwner || undefined 
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        setNewBusinessName('')
        setNewBusinessOwner('')
        router.push(`/businesses/${data.data.id}/dashboard`)
      }
    } catch (error) {
      console.error('Error creating business:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">העסקים שלי</h1>
            <p className="text-gray-600 mt-1">נהל וצפה בתחזיות העסקים שלך</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            הוסף עסק
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">עדיין אין עסקים</h3>
            <p className="text-gray-600 mb-6">התחל על ידי הוספת העסק הראשון שלך</p>
            <Button onClick={() => setIsModalOpen(true)}>הוסף עסק ראשון</Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/businesses/${business.id}/dashboard`}
                className="block"
              >
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {business.name}
                      </h3>
                      {business.ownerName && (
                        <p className="text-sm text-gray-500">{business.ownerName}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <span>{business._count.drivers} דרייברים</span>
                    <span>{business._count.loans} הלוואות</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-sm text-blue-600 font-medium flex items-center">
                      צפה בדשבורד
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Business Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="הוסף עסק חדש"
      >
        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <Input
            label="שם העסק"
            value={newBusinessName}
            onChange={(e) => setNewBusinessName(e.target.value)}
            placeholder="לדוגמה: קפה הפינה"
            required
          />
          <Input
            label="שם בעל העסק (אופציונלי)"
            value={newBusinessOwner}
            onChange={(e) => setNewBusinessOwner(e.target.value)}
            placeholder="לדוגמה: ישראל ישראלי"
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={creating} className="flex-1">
              צור עסק
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
