'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui'
import { LogIn, BarChart3, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    securityAnswer1: '',
    securityAnswer2: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: formData.username,
        password: formData.password,
        securityAnswer1: formData.securityAnswer1,
        securityAnswer2: formData.securityAnswer2,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('שגיאה בהתחברות')
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl">התחברות למערכת</CardTitle>
          <CardDescription>הזן את פרטי ההתחברות שלך</CardDescription>
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
              required
            />

            <Input
              label="סיסמה"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-3">שאלות ביטחון (חובה)</p>
              
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
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <LogIn className="h-4 w-4" />
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>

            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>
                אין לך חשבון?{' '}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  הרשמה
                </Link>
              </p>
              <p>
                <Link href="/auth/recover" className="text-gray-400 hover:text-primary hover:underline">
                  שכחת סיסמה? (למנהלים)
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
