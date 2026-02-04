'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeyRound, BarChart3, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default function RecoverPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בשחזור הסיסמה')
      } else {
        setTempPassword(data.tempPassword)
        setStep('success')
      }
    } catch (err) {
      setError('שגיאה בשחזור הסיסמה')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-bold">סיסמה זמנית נוצרה!</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">הסיסמה הזמנית שלך:</p>
              <p className="text-2xl font-mono font-bold text-yellow-900 bg-yellow-100 p-2 rounded">
                {tempPassword}
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ הסיסמה תקפה ל-30 דקות בלבד!
              </p>
            </div>

            <p className="text-sm text-gray-500">
              לאחר הכניסה עם הסיסמה הזמנית, תוכל להגדיר סיסמה חדשה
            </p>

            <Link href="/auth/login">
              <Button className="w-full">
                עבור להתחברות
              </Button>
            </Link>
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
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">שחזור סיסמה</CardTitle>
          <CardDescription>
            הזן את כתובת המייל לשחזור שהגדרת בעבר
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Mail className="h-4 w-4 inline ml-1" />
                הזן את כתובת המייל המדויקת שהגדרת בכניסה הראשונה
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

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <KeyRound className="h-4 w-4" />
              {isLoading ? 'מאמת...' : 'שחזר סיסמה'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/auth/login" className="text-primary hover:underline">
                חזרה להתחברות
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
