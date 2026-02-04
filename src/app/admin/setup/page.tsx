'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui'
import { Shield, Mail, AlertCircle, CheckCircle, Lock } from 'lucide-react'

export default function AdminSetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSetup, setIsSetup] = useState<boolean | null>(null)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-setup')
      const data = await response.json()
      setIsSetup(data.isSetup)
    } catch (error) {
      console.error('Error checking setup:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (email !== confirmEmail) {
      setError('כתובות המייל אינן תואמות')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('כתובת מייל לא תקינה')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/setup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בשמירת כתובת המייל')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      }
    } catch (err) {
      setError('שגיאה בשמירת כתובת המייל')
    } finally {
      setIsLoading(false)
    }
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">גישה נדחתה</h1>
          <p className="text-gray-500">דף זה מיועד למנהלים בלבד</p>
        </Card>
      </div>
    )
  }

  if (isSetup === true) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Lock className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">כתובת המייל כבר הוגדרה</h1>
          <p className="text-gray-500 mb-4">
            לא ניתן לשנות את כתובת המייל לשחזור לאחר ההגדרה הראשונית
          </p>
          <Button onClick={() => router.push('/admin')}>
            חזרה לדף הניהול
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">כתובת המייל נשמרה!</h1>
          <p className="text-gray-500">מעביר לדף הניהול...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">הגדרת מייל לשחזור</CardTitle>
          <CardDescription>
            הזן כתובת מייל לשחזור סיסמה. שים לב - לא תוכל לשנות אותה אחר כך!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>שים לב:</strong> כתובת המייל תישמר באופן מוצפן ולא תוצג שוב. 
                וודא שהכתובת נכונה - לא ניתן לשנות אותה!
              </p>
            </div>

            <Input
              label="כתובת מייל לשחזור"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label="אימות כתובת מייל"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <Mail className="h-4 w-4" />
              {isLoading ? 'שומר...' : 'שמור כתובת מייל'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
