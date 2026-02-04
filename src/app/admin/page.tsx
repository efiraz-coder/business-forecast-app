'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { Shield, Users, Eye, Trash2, RefreshCw, AlertTriangle, Mail } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: string
  username: string
  businessName: string
  role: string
  createdAt: string
  business?: {
    id: string
    name: string
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmailSetup, setIsEmailSetup] = useState<boolean | null>(null)

  useEffect(() => {
    fetchUsers()
    checkEmailSetup()
  }, [])

  const checkEmailSetup = async () => {
    try {
      const response = await fetch('/api/admin/check-setup')
      const data = await response.json()
      setIsEmailSetup(data.isSetup)
    } catch (error) {
      console.error('Error checking setup:', error)
    }
  }

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`האם למחוק את המשתמש ${username}?`)) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">גישה נדחתה</h1>
          <p className="text-gray-500">אין לך הרשאות לצפות בדף זה</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">ניהול מערכת</h1>
              <p className="text-sm text-gray-500">צפייה בכל המשתמשים והעסקים</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            רענון
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Email Setup Alert */}
        {isEmailSetup === false && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">הגדרת מייל לשחזור</h3>
                <p className="text-sm text-yellow-700">
                  טרם הגדרת כתובת מייל לשחזור סיסמה. מומלץ להגדיר עכשיו!
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/admin/setup')}
              className="bg-yellow-600 hover:bg-yellow-700 gap-2"
            >
              <Mail className="h-4 w-4" />
              הגדר מייל
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-gray-500">סה״כ משתמשים</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">מנהלים</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">משתמשים רגילים</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">טוען...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם משתמש</TableHead>
                    <TableHead>שם עסק</TableHead>
                    <TableHead>תפקיד</TableHead>
                    <TableHead>תאריך הרשמה</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.businessName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.business && (
                            <Link href={`/admin/view/${user.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {user.role !== 'admin' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(user.id, user.username)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
