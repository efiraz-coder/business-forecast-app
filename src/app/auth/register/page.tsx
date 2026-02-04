'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui'
import { UserPlus, BarChart3, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    securityAnswer1: '',
    securityAnswer2: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          businessName: formData.businessName,
          securityAnswer1: formData.securityAnswer1,
          securityAnswer2: formData.securityAnswer2,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בהרשמה')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err) {
      setError('שגיאה בהרשמה')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">ההרשמה הושלמה בהצלחה!</h2>
            <p className="text-gray-500">מעביר אותך לדף ההתחברות...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-white p-3 rounded-xl">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">הרשמה למערכת</CardTitle>
          <CardDescription>צור חשבון חדש לתכנון פיננסי</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Input
              label="שם משתמש"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="לדוגמה: david123"
              required
            />

            <Input
              label="שם העסק"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="לדוגמה: המאפיה של דוד"
              required
            />

            <Input
              label="סיסמה"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              hint="לפחות 6 תווים"
              required
            />

            <Input
              label="אימות סיסמה"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">שאלות ביטחון</p>
              <p className="text-xs text-gray-500 mb-3">
                התשובות ישמשו לאימות בכל התחברות - זכור אותן!
              </p>
              
              <Input
                label="מה שם בית הספר היסודי שלך?"
                value={formData.securityAnswer1}
                onChange={(e) => setFormData({ ...formData, securityAnswer1: e.target.value })}
                required
              />

              <div className="mt-4">
                <Input
                  label="מה שם חיית המחמד שלך?"
                  value={formData.securityAnswer2}
                  onChange={(e) => setFormData({ ...formData, securityAnswer2: e.target.value })}
                  hint="אם אין לך, כתוב שם כלשהו שתזכור"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <UserPlus className="h-4 w-4" />
              {isLoading ? 'נרשם...' : 'הרשמה'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              יש לך כבר חשבון?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                התחברות
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
